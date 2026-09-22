import "server-only";

/**
 * Mirrors the Postgres generate_unique_username() function in
 * supabase/migrations/002_profile_roles_and_public_profiles.sql, so mock
 * mode produces usernames with the same shape/collision behavior as
 * production. `isTaken` is injected so this stays a pure-ish, testable
 * function rather than reaching into a store directly.
 */
export function generateUniqueUsername(
  base: string,
  seedId: string,
  isTaken: (candidate: string) => boolean
): string {
  const slug = base.toLowerCase().replace(/[^a-z0-9]+/g, "") || "member";
  const seed = seedId.replace(/-/g, "");

  let candidate = slug;
  let attempt = 0;

  while (isTaken(candidate)) {
    attempt += 1;
    if (attempt > 5) {
      candidate = `${slug}${seed.slice(0, 8)}`;
      break;
    }
    candidate = `${slug}${seed.slice(0, 4 + attempt)}`;
  }

  return candidate;
}
