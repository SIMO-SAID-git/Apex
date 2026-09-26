import "server-only";
import { randomUUID } from "crypto";
import type { MembershipChangeEvent, MembershipTier } from "@/types/membership";
import { getTierConfig } from "@/config/membership";
import { isMockMode } from "@/config/site";
import { getSupabaseServerClient, getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { createNotification } from "@/lib/services/notification-service";

export interface MembershipRepository {
  changeTier(userId: string, toTier: MembershipTier): Promise<MembershipChangeEvent>;
  getHistory(userId: string): Promise<MembershipChangeEvent[]>;
}

class InMemoryMembershipStore {
  private static instance: InMemoryMembershipStore;
  events: MembershipChangeEvent[] = [];
  private constructor() {}
  static get(): InMemoryMembershipStore {
    if (!InMemoryMembershipStore.instance) InMemoryMembershipStore.instance = new InMemoryMembershipStore();
    return InMemoryMembershipStore.instance;
  }
}

export class MockMembershipRepository implements MembershipRepository {
  async changeTier(userId: string, toTier: MembershipTier): Promise<MembershipChangeEvent> {
    const { MockProfileRepository, setMockMembershipTier } = await import("@/lib/services/profile-service");
    const profileRepo = new MockProfileRepository();
    const existing = await profileRepo.getProfile(userId);
    if (!existing) throw new Error("PROFILE_NOT_FOUND");

    const fromTier: MembershipTier = existing.membershipTier;
    setMockMembershipTier(userId, toTier);

    const event: MembershipChangeEvent = {
      id: randomUUID(),
      userId,
      fromTier,
      toTier,
      direction:
        fromTier === toTier ? "initial" : getTierConfig(toTier).rank > getTierConfig(fromTier).rank ? "upgrade" : "downgrade",
      createdAt: new Date().toISOString(),
    };
    InMemoryMembershipStore.get().events.unshift(event);
    void createNotification(
      userId,
      "account_event",
      "Membership updated",
      `You're now on the ${getTierConfig(toTier).name} plan.`
    );
    return event;
  }

  async getHistory(userId: string): Promise<MembershipChangeEvent[]> {
    return InMemoryMembershipStore.get().events.filter((e) => e.userId === userId);
  }
}

export class SupabaseMembershipRepository implements MembershipRepository {
  async changeTier(userId: string, toTier: MembershipTier): Promise<MembershipChangeEvent> {
    const client = getSupabaseServerClient();
    if (!client) throw new Error("Supabase is not configured.");

    const { data: profileRow, error: profileError } = await client
      .from("profiles")
      .select("membership_tier")
      .eq("user_id", userId)
      .single();
    if (profileError) throw profileError;

    const fromTier = profileRow.membership_tier as MembershipTier;

    const { error: updateError } = await client
      .from("profiles")
      .update({ membership_tier: toTier, updated_at: new Date().toISOString() })
      .eq("user_id", userId);
    if (updateError) throw updateError;

    // membership_events has no insert policy for the authenticated role by
    // design (see the migration) — logging the change requires the
    // service-role client, exactly like /api/account's user deletion.
    const serviceClient = getSupabaseServiceRoleClient();
    const direction =
      fromTier === toTier ? "initial" : getTierConfig(toTier).rank > getTierConfig(fromTier).rank ? "upgrade" : "downgrade";

    if (serviceClient) {
      const { data, error } = await serviceClient
        .from("membership_events")
        .insert({ user_id: userId, from_tier: fromTier, to_tier: toTier, direction })
        .select("*")
        .single();
      if (!error && data) {
        void createNotification(userId, "account_event", "Membership updated", `You're now on the ${getTierConfig(toTier).name} plan.`);
        return {
          id: data.id,
          userId: data.user_id,
          fromTier: data.from_tier,
          toTier: data.to_tier,
          direction: data.direction,
          createdAt: data.created_at,
        };
      }
    }

    void createNotification(userId, "account_event", "Membership updated", `You're now on the ${getTierConfig(toTier).name} plan.`);
    return { id: randomUUID(), userId, fromTier, toTier, direction, createdAt: new Date().toISOString() };
  }

  async getHistory(userId: string): Promise<MembershipChangeEvent[]> {
    const client = getSupabaseServerClient();
    if (!client) throw new Error("Supabase is not configured.");

    const { data, error } = await client
      .from("membership_events")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;

    return (data ?? []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      fromTier: row.from_tier,
      toTier: row.to_tier,
      direction: row.direction,
      createdAt: row.created_at,
    }));
  }
}

export function getMembershipRepository(): MembershipRepository {
  return isMockMode ? new MockMembershipRepository() : new SupabaseMembershipRepository();
}
