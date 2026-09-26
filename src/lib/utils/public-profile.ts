import type { CustomerProfile, PublicProfile } from "@/types/profile";
import type { PublicClassSummary } from "@/types/class";

/**
 * Client-safe mirror of the server-side toPublicProfile() in
 * lib/services/profile-service.ts, used only for the owner's own "preview
 * as others" toggle (components/profile/profile-owner-panel.tsx). This is
 * never used to decide what a *different* visitor can see — that boundary
 * is enforced server-side by getPublicProfile()/the public_profiles view.
 */
export function mapToPublicProfile(profile: CustomerProfile, upcomingClasses: PublicClassSummary[] = []): PublicProfile {
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
