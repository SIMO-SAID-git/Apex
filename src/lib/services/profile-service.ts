import "server-only";
import { randomUUID } from "crypto";
import type { CustomerProfile, UpdateProfileInput } from "@/types/profile";
import { isMockMode } from "@/config/site";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export interface ProfileRepository {
  getProfile(userId: string): Promise<CustomerProfile | null>;
  updateProfile(userId: string, input: UpdateProfileInput): Promise<CustomerProfile>;
  updateAvatarUrl(userId: string, avatarUrl: string | null): Promise<CustomerProfile>;
  deleteProfile(userId: string): Promise<void>;
}

interface CreateProfileInput {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}

class InMemoryProfileStore {
  private static instance: InMemoryProfileStore;
  profiles: Map<string, CustomerProfile> = new Map();

  private constructor() {}

  static get(): InMemoryProfileStore {
    if (!InMemoryProfileStore.instance) {
      InMemoryProfileStore.instance = new InMemoryProfileStore();
    }
    return InMemoryProfileStore.instance;
  }
}

/**
 * Mock mode's stand-in for the `profiles` table + the `handle_new_user`
 * Postgres trigger (see supabase/migrations/001_customer_profiles.sql).
 * MockAuthService.signUp calls createMockProfile() right after creating the
 * mock auth user, mirroring what the trigger does automatically in
 * production.
 */
export function createMockProfile(input: CreateProfileInput): CustomerProfile {
  const now = new Date().toISOString();
  const profile: CustomerProfile = {
    id: randomUUID(),
    userId: input.userId,
    firstName: input.firstName,
    lastName: input.lastName,
    displayName: `${input.firstName} ${input.lastName}`.trim(),
    email: input.email,
    avatarUrl: null,
    phone: null,
    fitnessGoal: null,
    createdAt: now,
    updatedAt: now,
  };
  InMemoryProfileStore.get().profiles.set(input.userId, profile);
  return profile;
}

export class MockProfileRepository implements ProfileRepository {
  async getProfile(userId: string): Promise<CustomerProfile | null> {
    return InMemoryProfileStore.get().profiles.get(userId) ?? null;
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<CustomerProfile> {
    const store = InMemoryProfileStore.get();
    const existing = store.profiles.get(userId);
    if (!existing) {
      throw new Error("PROFILE_NOT_FOUND");
    }
    const updated: CustomerProfile = {
      ...existing,
      ...input,
      displayName: input.displayName ?? existing.displayName,
      updatedAt: new Date().toISOString(),
    };
    store.profiles.set(userId, updated);
    return updated;
  }

  async updateAvatarUrl(userId: string, avatarUrl: string | null): Promise<CustomerProfile> {
    const store = InMemoryProfileStore.get();
    const existing = store.profiles.get(userId);
    if (!existing) throw new Error("PROFILE_NOT_FOUND");
    const updated: CustomerProfile = { ...existing, avatarUrl, updatedAt: new Date().toISOString() };
    store.profiles.set(userId, updated);
    return updated;
  }

  async deleteProfile(userId: string): Promise<void> {
    InMemoryProfileStore.get().profiles.delete(userId);
  }
}

/**
 * Queries the `profiles` table using the session-bound server client (see
 * lib/supabase/server.ts). Because this client carries the caller's own
 * session cookie, every query below runs AS that user in Postgres's eyes —
 * Row Level Security (see the migration) is what actually prevents reading
 * or writing another customer's row, not this application code.
 */
export class SupabaseProfileRepository implements ProfileRepository {
  private client() {
    const client = getSupabaseServerClient();
    if (!client) throw new Error("Supabase is not configured.");
    return client;
  }

  async getProfile(userId: string): Promise<CustomerProfile | null> {
    const { data, error } = await this.client()
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return mapRow(data);
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<CustomerProfile> {
    const { data, error } = await this.client()
      .from("profiles")
      .update({
        first_name: input.firstName,
        last_name: input.lastName,
        display_name: input.displayName,
        phone: input.phone,
        fitness_goal: input.fitnessGoal,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) throw error;
    return mapRow(data);
  }

  async updateAvatarUrl(userId: string, avatarUrl: string | null): Promise<CustomerProfile> {
    const { data, error } = await this.client()
      .from("profiles")
      .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) throw error;
    return mapRow(data);
  }

  async deleteProfile(userId: string): Promise<void> {
    const { error } = await this.client().from("profiles").delete().eq("user_id", userId);
    if (error) throw error;
  }
}

interface ProfileRow {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  email: string;
  avatar_url: string | null;
  phone: string | null;
  fitness_goal: CustomerProfile["fitnessGoal"];
  created_at: string;
  updated_at: string;
}

function mapRow(row: ProfileRow): CustomerProfile {
  return {
    id: row.id,
    userId: row.user_id,
    firstName: row.first_name,
    lastName: row.last_name,
    displayName: row.display_name,
    email: row.email,
    avatarUrl: row.avatar_url,
    phone: row.phone,
    fitnessGoal: row.fitness_goal,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getProfileRepository(): ProfileRepository {
  return isMockMode ? new MockProfileRepository() : new SupabaseProfileRepository();
}
