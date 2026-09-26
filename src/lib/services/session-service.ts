import "server-only";
import { randomUUID } from "crypto";
import type { CreateSessionInput, TrainerSession } from "@/types/session";
import { isMockMode } from "@/config/site";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getProfileRepository } from "@/lib/services/profile-service";
import { createNotification } from "@/lib/services/notification-service";

export interface SessionRepository {
  bookSession(memberUserId: string, input: CreateSessionInput): Promise<TrainerSession>;
  getSessionsForMember(memberUserId: string): Promise<TrainerSession[]>;
  getSessionsForTrainer(trainerUserId: string): Promise<TrainerSession[]>;
}

export class SessionError extends Error {
  code: "TRAINER_NOT_FOUND" | "NOT_ELITE" | "INVALID_TIME";
  constructor(code: "TRAINER_NOT_FOUND" | "NOT_ELITE" | "INVALID_TIME", message: string) {
    super(message);
    this.name = "SessionError";
    this.code = code;
  }
}

class InMemorySessionStore {
  private static instance: InMemorySessionStore;
  sessions: TrainerSession[] = [];
  private constructor() {}
  static get(): InMemorySessionStore {
    if (!InMemorySessionStore.instance) InMemorySessionStore.instance = new InMemorySessionStore();
    return InMemorySessionStore.instance;
  }
}

/**
 * Booking a 1:1 checks TWO things server-side, never trusting the client:
 * the caller's own membership tier must be "elite" (task #4's perk), and
 * the target username must actually resolve to a trainer account.
 */
export class MockSessionRepository implements SessionRepository {
  async bookSession(memberUserId: string, input: CreateSessionInput): Promise<TrainerSession> {
    const profileRepo = getProfileRepository();
    const member = await profileRepo.getProfile(memberUserId);
    if (member?.role === "trainer" || member?.membershipTier !== "elite") {
      throw new SessionError("NOT_ELITE", "1:1 sessions are an Elite membership perk.");
    }

    const trainerProfile = await profileRepo.getPublicProfile(input.trainerUsername);
    if (!trainerProfile || trainerProfile.role !== "trainer") {
      throw new SessionError("TRAINER_NOT_FOUND", "This trainer could not be found.");
    }

    if (new Date(input.scheduledAt).getTime() <= Date.now()) {
      throw new SessionError("INVALID_TIME", "Choose a time in the future.");
    }

    const { getUserIdByUsernameMock } = await import("@/lib/services/profile-service");
    const trainerUserId = getUserIdByUsernameMock(input.trainerUsername);
    if (!trainerUserId) {
      throw new SessionError("TRAINER_NOT_FOUND", "This trainer could not be found.");
    }

    const session: TrainerSession = {
      id: randomUUID(),
      trainerUserId,
      memberUserId,
      scheduledAt: input.scheduledAt,
      durationMinutes: input.durationMinutes ?? 60,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };
    InMemorySessionStore.get().sessions.push(session);

    const when = new Date(input.scheduledAt).toLocaleString();
    void createNotification(memberUserId, "session_booked", "1:1 session booked", `Your session with ${trainerProfile.displayName} is set for ${when}.`);
    void createNotification(trainerUserId, "session_booked", "New 1:1 session request", `${member?.displayName ?? "A member"} booked a session for ${when}.`);

    return session;
  }

  async getSessionsForMember(memberUserId: string): Promise<TrainerSession[]> {
    return InMemorySessionStore.get().sessions.filter((s) => s.memberUserId === memberUserId);
  }

  async getSessionsForTrainer(trainerUserId: string): Promise<TrainerSession[]> {
    return InMemorySessionStore.get().sessions.filter((s) => s.trainerUserId === trainerUserId);
  }
}

export class SupabaseSessionRepository implements SessionRepository {
  async bookSession(memberUserId: string, input: CreateSessionInput): Promise<TrainerSession> {
    const client = getSupabaseServerClient();
    if (!client) throw new Error("Supabase is not configured.");

    const { data: memberRow, error: memberError } = await client
      .from("profiles")
      .select("membership_tier, role")
      .eq("user_id", memberUserId)
      .single();
    if (memberError) throw memberError;
    if (memberRow.role === "trainer" || memberRow.membership_tier !== "elite") {
      throw new SessionError("NOT_ELITE", "1:1 sessions are an Elite membership perk.");
    }

    const { data: trainerRow, error: trainerError } = await client
      .from("public_profiles")
      .select("user_id, role")
      .ilike("username", input.trainerUsername)
      .maybeSingle();
    if (trainerError) throw trainerError;
    if (!trainerRow || trainerRow.role !== "trainer") {
      throw new SessionError("TRAINER_NOT_FOUND", "This trainer could not be found.");
    }

    if (new Date(input.scheduledAt).getTime() <= Date.now()) {
      throw new SessionError("INVALID_TIME", "Choose a time in the future.");
    }

    const { data, error } = await client
      .from("trainer_sessions")
      .insert({
        trainer_user_id: trainerRow.user_id,
        member_user_id: memberUserId,
        scheduled_at: input.scheduledAt,
        duration_minutes: input.durationMinutes ?? 60,
      })
      .select("*")
      .single();
    if (error) throw error;

    const when = new Date(input.scheduledAt).toLocaleString();
    void createNotification(memberUserId, "session_booked", "1:1 session booked", `Your session is set for ${when}.`);
    void createNotification(trainerRow.user_id, "session_booked", "New 1:1 session request", `A member booked a session for ${when}.`);

    return mapSessionRow(data);
  }

  async getSessionsForMember(memberUserId: string): Promise<TrainerSession[]> {
    const client = getSupabaseServerClient();
    if (!client) throw new Error("Supabase is not configured.");
    const { data, error } = await client
      .from("trainer_sessions")
      .select("*")
      .eq("member_user_id", memberUserId)
      .order("scheduled_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapSessionRow);
  }

  async getSessionsForTrainer(trainerUserId: string): Promise<TrainerSession[]> {
    const client = getSupabaseServerClient();
    if (!client) throw new Error("Supabase is not configured.");
    const { data, error } = await client
      .from("trainer_sessions")
      .select("*")
      .eq("trainer_user_id", trainerUserId)
      .order("scheduled_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapSessionRow);
  }
}

interface SessionRow {
  id: string;
  trainer_user_id: string;
  member_user_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: TrainerSession["status"];
  created_at: string;
}

function mapSessionRow(row: SessionRow): TrainerSession {
  return {
    id: row.id,
    trainerUserId: row.trainer_user_id,
    memberUserId: row.member_user_id,
    scheduledAt: row.scheduled_at,
    durationMinutes: row.duration_minutes,
    status: row.status,
    createdAt: row.created_at,
  };
}

export function getSessionRepository(): SessionRepository {
  return isMockMode ? new MockSessionRepository() : new SupabaseSessionRepository();
}
