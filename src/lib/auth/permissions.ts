import type { CustomerProfile } from "@/types/profile";
import { canBookClasses, canViewRoster, getTierConfig } from "@/config/membership";

/**
 * Centralized permission checks so booking UI, roster UI, and API routes
 * all agree on the same rules rather than re-deriving them ad hoc. A
 * `CustomerProfile | null | undefined` covers "not signed in yet" /
 * "still loading" without every call site having to guard separately.
 */

export function isTrainer(profile: CustomerProfile | null | undefined): boolean {
  return profile?.role === "trainer";
}

/** Trainers get full platform access without paying for a tier. */
export function hasFullAccess(profile: CustomerProfile | null | undefined): boolean {
  if (!profile) return false;
  if (isTrainer(profile)) return true;
  return canBookClasses(profile.membershipTier);
}

/** Trainers manage classes, not attend them — they are never "the attendee". */
export function canBookAsAttendee(profile: CustomerProfile | null | undefined): boolean {
  if (!profile) return false;
  if (isTrainer(profile)) return false;
  return canBookClasses(profile.membershipTier);
}

export function canViewAttendeeRoster(profile: CustomerProfile | null | undefined): boolean {
  if (!profile) return false;
  if (isTrainer(profile)) return true;
  return canViewRoster(profile.membershipTier);
}

export function isElite(profile: CustomerProfile | null | undefined): boolean {
  return Boolean(profile) && !isTrainer(profile) && profile!.membershipTier === "elite";
}

export function membershipRank(profile: CustomerProfile | null | undefined): number {
  if (!profile) return -1;
  return getTierConfig(profile.membershipTier).rank;
}
