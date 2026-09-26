import "server-only";
import { randomUUID } from "crypto";
import type { CustomerProfile, PublicProfile, TrainerDetails, UpdateProfileInput, UserRole } from "@/types/profile";
import type { PublicClassSummary } from "@/types/class";
import { isMockMode } from "@/config/site";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { generateUniqueUsername } from "@/lib/utils/username";
import { getClassRepository } from "@/lib/services/booking-service";

export interface ProfileRepository {
  getProfile(userId: string): Promise<CustomerProfile | null>;
  updateProfile(userId: string, input: UpdateProfileInput): Promise<CustomerProfile>;
  updateAvatarUrl(userId: string, avatarUrl: string | null): Promise<CustomerProfile>;
  deleteProfile(userId: string): Promise<void>;
  /** Public-safe lookup for /profile/[username] — never returns email/phone/userId. */
  getPublicProfile(username: string): Promise<PublicProfile | null>;
}

interface CreateProfileInput {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  /** Defaults to "member" — mirrors handle_new_user()'s whitelist in the migration. */
  role?: UserRole;
}

const EMPTY_TRAINER_DETAILS: TrainerDetails = {
  bio: "",
  specialties: [],
  certifications: [],
  hourlyRate: null,
  socialLinks: {},
  availability: [],
};

/** Shared by both the mock and Supabase public-profile lookups — a
 *  trainer's public "upcoming classes" list is always derived the same way:
 *  their own published classes, today or later, soonest first. */
async function getUpcomingClassSummaries(instructorUserId: string, limit = 6): Promise<PublicClassSummary[]> {
  const todayIso = new Date().toISOString().slice(0, 10);
  const classes = await getClassRepository().getClasses({ instructorId: instructorUserId });

  return classes
    .filter((c) => c.date >= todayIso)
    .sort((a, b) => (a.date === b.date ? a.startTime.localeCompare(b.startTime) : a.date.localeCompare(b.date)))
    .slice(0, limit)
    .map((c) => ({
      id: c.id,
      title: c.title,
      date: c.date,
      startTime: c.startTime,
      endTime: c.endTime,
      category: c.category,
      intensity: c.intensity,
    }));
}

class InMemoryProfileStore {
  private static instance: InMemoryProfileStore;
  profiles: Map<string, CustomerProfile> = new Map(); // keyed by userId

  private constructor() {}

  static get(): InMemoryProfileStore {
    if (!InMemoryProfileStore.instance) {
      InMemoryProfileStore.instance = new InMemoryProfileStore();
    }
    return InMemoryProfileStore.instance;
  }

  findByUsername(username: string): CustomerProfile | undefined {
    const target = username.toLowerCase();
    return Array.from(this.profiles.values()).find((p) => p.username.toLowerCase() === target);
  }
}

/**
 * Mock mode's stand-in for the `profiles`/`trainer_details` tables + the
 * `handle_new_user` Postgres trigger (see
 * supabase/migrations/001_customer_profiles.sql and 002_profile_roles_and_public_profiles.sql).
 * MockAuthService.signUp calls this right after creating the mock auth
 * user, mirroring what the trigger does automatically in production —
 * including generating a unique username and seeding empty trainer details
 * when role === "trainer".
 */
export function createMockProfile(input: CreateProfileInput): CustomerProfile {
  const now = new Date().toISOString();
  const store = InMemoryProfileStore.get();
  const role: UserRole = input.role === "trainer" ? "trainer" : "member";

  const username = generateUniqueUsername(
    `${input.firstName}${input.lastName}`,
    input.userId,
    (candidate) => Boolean(store.findByUsername(candidate))
  );

  const profile: CustomerProfile = {
    id: randomUUID(),
    userId: input.userId,
    username,
    role,
    firstName: input.firstName,
    lastName: input.lastName,
    displayName: `${input.firstName} ${input.lastName}`.trim(),
    email: input.email,
    avatarUrl: null,
    phone: null,
    bio: null,
    fitnessGoal: null,
    languagePreference: "en",
    membershipTier: "free",
    trainer: role === "trainer" ? { ...EMPTY_TRAINER_DETAILS } : null,
    createdAt: now,
    updatedAt: now,
  };
  store.profiles.set(input.userId, profile);
  return profile;
}

/** Used only by MockMembershipRepository — membership tier changes go through
 *  a dedicated flow with business rules, not the generic profile PATCH. */
export function setMockMembershipTier(userId: string, tier: CustomerProfile["membershipTier"]): void {
  const store = InMemoryProfileStore.get();
  const existing = store.profiles.get(userId);
  if (!existing) throw new Error("PROFILE_NOT_FOUND");
  store.profiles.set(userId, { ...existing, membershipTier: tier, updatedAt: new Date().toISOString() });
}

/** Internal-only (mock mode) helper for session-service.ts, which needs a
 *  trainer's userId to record a session but only ever has their public
 *  username. Never exported to anything outside lib/services/*. */
export function getUserIdByUsernameMock(username: string): string | null {
  return InMemoryProfileStore.get().findByUsername(username)?.userId ?? null;
}

/** Resolves a public username to its userId for internal server-side uses
 *  only (recording a profile view, booking a 1:1 session) — never returned
 *  to a client. Works in both mock and Supabase mode. */
export async function resolveUserIdByUsername(username: string): Promise<string | null> {
  if (isMockMode) {
    return getUserIdByUsernameMock(username);
  }

  const client = getSupabaseServerClient();
  if (!client) return null;

  const { data } = await client.from("public_profiles").select("user_id").ilike("username", username).maybeSingle();
  return data?.user_id ?? null;
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

    const { trainer: trainerPatch, ...rest } = input;

    const updated: CustomerProfile = {
      ...existing,
      ...rest,
      displayName: input.displayName ?? existing.displayName,
      trainer:
        existing.role === "trainer"
          ? { ...(existing.trainer ?? EMPTY_TRAINER_DETAILS), ...trainerPatch }
          : null,
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

  async getPublicProfile(username: string): Promise<PublicProfile | null> {
    const profile = InMemoryProfileStore.get().findByUsername(username);
    if (!profile) return null;
    const upcomingClasses = profile.role === "trainer" ? await getUpcomingClassSummaries(profile.userId) : [];
    return toPublicProfile(profile, upcomingClasses);
  }
}

/**
 * Queries the `profiles`/`trainer_details` tables using the session-bound
 * server client (see lib/supabase/server.ts) for owner reads/writes, and the
 * public `public_profiles` view (see the migration) for anonymous reads.
 * RLS — not this application code — is what actually prevents reading or
 * writing another customer's private row.
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
      .select("*, trainer_details(*)")
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
        bio: input.bio,
        fitness_goal: input.fitnessGoal,
        language_preference: input.languagePreference,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select("*, trainer_details(*)")
      .single();

    if (error) throw error;

    if (input.trainer) {
      const { error: trainerError } = await this.client()
        .from("trainer_details")
        .update({
          bio: input.trainer.bio,
          specialties: input.trainer.specialties,
          certifications: input.trainer.certifications,
          hourly_rate: input.trainer.hourlyRate,
          social_links: input.trainer.socialLinks,
          availability: input.trainer.availability,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);
      if (trainerError) throw trainerError;
    }

    return this.getProfile(userId) as Promise<CustomerProfile>;
  }

  async updateAvatarUrl(userId: string, avatarUrl: string | null): Promise<CustomerProfile> {
    const { error } = await this.client()
      .from("profiles")
      .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
      .eq("user_id", userId);

    if (error) throw error;
    return this.getProfile(userId) as Promise<CustomerProfile>;
  }

  async deleteProfile(userId: string): Promise<void> {
    const { error } = await this.client().from("profiles").delete().eq("user_id", userId);
    if (error) throw error;
  }

  async getPublicProfile(username: string): Promise<PublicProfile | null> {
    // Queries the public_profiles VIEW, not the base `profiles` table —
    // this is what makes it safe to call with the anon key / no session at
    // all: the view's column list is the allowlist (see the migration),
    // there's no risk of a future `select("*")` on `profiles` leaking here.
    const { data, error } = await this.client()
      .from("public_profiles")
      .select("*")
      .ilike("username", username)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const upcomingClasses = data.role === "trainer" ? await getUpcomingClassSummaries(data.user_id) : [];
    return mapPublicRow(data, upcomingClasses);
  }
}

interface TrainerDetailsRow {
  bio: string;
  specialties: string[];
  certifications: string[];
  hourly_rate: number | null;
  social_links: TrainerDetails["socialLinks"];
  availability: TrainerDetails["availability"];
}

interface ProfileRow {
  id: string;
  user_id: string;
  username: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  display_name: string;
  email: string;
  avatar_url: string | null;
  phone: string | null;
  bio: string | null;
  fitness_goal: CustomerProfile["fitnessGoal"];
  language_preference: string;
  membership_tier: CustomerProfile["membershipTier"];
  created_at: string;
  updated_at: string;
  trainer_details: TrainerDetailsRow[] | TrainerDetailsRow | null;
}

function mapRow(row: ProfileRow): CustomerProfile {
  const trainerRow = Array.isArray(row.trainer_details) ? row.trainer_details[0] : row.trainer_details;

  return {
    id: row.id,
    userId: row.user_id,
    username: row.username,
    role: row.role,
    firstName: row.first_name,
    lastName: row.last_name,
    displayName: row.display_name,
    email: row.email,
    avatarUrl: row.avatar_url,
    phone: row.phone,
    bio: row.bio,
    fitnessGoal: row.fitness_goal,
    languagePreference: row.language_preference,
    membershipTier: row.membership_tier,
    trainer:
      row.role === "trainer" && trainerRow
        ? {
            bio: trainerRow.bio,
            specialties: trainerRow.specialties as TrainerDetails["specialties"],
            certifications: trainerRow.certifications,
            hourlyRate: trainerRow.hourly_rate,
            socialLinks: trainerRow.social_links ?? {},
            availability: trainerRow.availability ?? [],
          }
        : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

interface PublicProfileRow {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  role: UserRole;
  fitness_goal: CustomerProfile["fitnessGoal"];
  member_bio: string | null;
  member_since: string;
  trainer_bio: string | null;
  specialties: string[] | null;
  certifications: string[] | null;
  hourly_rate: number | null;
  social_links: TrainerDetails["socialLinks"] | null;
  availability: TrainerDetails["availability"] | null;
}

function mapPublicRow(row: PublicProfileRow, upcomingClasses: PublicClassSummary[]): PublicProfile {
  if (row.role === "trainer") {
    return {
      role: "trainer",
      username: row.username,
      displayName: row.display_name,
      avatarUrl: row.avatar_url,
      bio: row.trainer_bio ?? "",
      specialties: (row.specialties as TrainerDetails["specialties"]) ?? [],
      certifications: row.certifications ?? [],
      hourlyRate: row.hourly_rate,
      socialLinks: row.social_links ?? {},
      availability: row.availability ?? [],
      upcomingClasses,
      memberSince: row.member_since,
    };
  }

  return {
    role: "member",
    username: row.username,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    bio: row.member_bio,
    fitnessGoal: row.fitness_goal,
    memberSince: row.member_since,
  };
}

function toPublicProfile(profile: CustomerProfile, upcomingClasses: PublicClassSummary[] = []): PublicProfile {
  if (profile.role === "trainer") {
    return {
      role: "trainer",
      username: profile.username,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      bio: profile.trainer?.bio ?? "",
      specialties: profile.trainer?.specialties ?? [],
      certifications: profile.trainer?.certifications ?? [],
      hourlyRate: profile.trainer?.hourlyRate ?? null,
      socialLinks: profile.trainer?.socialLinks ?? {},
      availability: profile.trainer?.availability ?? [],
      upcomingClasses,
      memberSince: profile.createdAt,
    };
  }

  return {
    role: "member",
    username: profile.username,
    displayName: profile.displayName,
    avatarUrl: profile.avatarUrl,
    bio: profile.bio,
    fitnessGoal: profile.fitnessGoal,
    memberSince: profile.createdAt,
  };
}

export function getProfileRepository(): ProfileRepository {
  return isMockMode ? new MockProfileRepository() : new SupabaseProfileRepository();
}
