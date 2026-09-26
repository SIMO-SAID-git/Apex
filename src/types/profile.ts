export type FitnessGoal =
  | "build-strength"
  | "lose-fat"
  | "improve-conditioning"
  | "mobility-recovery"
  | "general-fitness";

/** The two profile types this app supports. Stored on `profiles.role`. */
export type UserRole = "member" | "trainer";

export type TrainerSpecialty = "strength" | "hiit" | "cardio" | "zen";

export interface SocialLinks {
  instagram?: string;
  website?: string;
  youtube?: string;
}

/** One weekly recurring availability window, e.g. { day: "mon", start: "06:00", end: "12:00" }. */
export interface AvailabilityWindow {
  day: "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
  start: string;
  end: string;
}

/**
 * Trainer-only fields, stored in a separate `trainer_details` table
 * (see supabase/migrations/002_profile_roles_and_public_profiles.sql) rather
 * than as nullable columns on `profiles`, since they only ever exist for
 * role === "trainer" and several (specialties, hourlyRate, availability) are
 * public-facing marketing content rather than account settings.
 */
export interface TrainerDetails {
  bio: string;
  specialties: TrainerSpecialty[];
  certifications: string[];
  hourlyRate: number | null;
  socialLinks: SocialLinks;
  availability: AvailabilityWindow[];
}

/**
 * The full, private profile shape — everything the owner can see/edit on
 * /dashboard/settings. `trainer` is present only when role === "trainer".
 */
export interface CustomerProfile {
  id: string;
  userId: string;
  username: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  phone: string | null;
  bio: string | null;
  fitnessGoal: FitnessGoal | null;
  languagePreference: string;
  /** Ignored for trainers — trainers get full access via role, not a paid tier. */
  membershipTier: import("./membership").MembershipTier;
  trainer: TrainerDetails | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phone?: string | null;
  bio?: string | null;
  fitnessGoal?: FitnessGoal | null;
  languagePreference?: string;
  trainer?: Partial<TrainerDetails>;
}

/**
 * What an anonymous visitor to /profile/[username] is allowed to see.
 * Deliberately a NARROWER type than CustomerProfile, not the same interface
 * with fields hidden at render time — email, phone, and userId never even
 * reach this shape, so there's no path by which a template change could
 * accidentally leak them (see ProfileRepository.getPublicProfile).
 */
export interface PublicMemberProfile {
  role: "member";
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  fitnessGoal: FitnessGoal | null;
  memberSince: string;
}

export interface PublicTrainerProfile {
  role: "trainer";
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string;
  specialties: TrainerSpecialty[];
  certifications: string[];
  hourlyRate: number | null;
  socialLinks: SocialLinks;
  availability: AvailabilityWindow[];
  upcomingClasses: import("./class").PublicClassSummary[];
  memberSince: string;
}

export type PublicProfile = PublicMemberProfile | PublicTrainerProfile;
