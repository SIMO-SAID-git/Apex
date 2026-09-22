import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProfileRepository } from "@/lib/services/profile-service";
import { getServerAuthUser } from "@/lib/auth/session";
import { PageContainer } from "@/components/layout/page-container";
import { ProfileHeader } from "@/components/profile/profile-header";
import { MemberProfile } from "@/components/profile/member-profile";
import { TrainerProfile } from "@/components/profile/trainer-profile";
import { buttonVariants } from "@/components/ui/button";

interface PageProps {
  params: { username: string };
}

/**
 * Public, SEO-indexable profile page — fetches through the same
 * ProfileRepository the API route uses, but calls it directly server-side
 * to avoid an unnecessary self-fetch round trip during SSR. Never touches
 * `profiles`/`trainer_details` directly: getPublicProfile() is the only
 * method this page (or the API route) is allowed to call, and it can only
 * ever return the narrow PublicProfile shape (see types/profile.ts).
 */
async function loadProfile(username: string) {
  const repository = getProfileRepository();
  return repository.getPublicProfile(username);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const profile = await loadProfile(params.username);
  if (!profile) return { title: "Profile not found" };

  const description =
    profile.role === "trainer"
      ? profile.bio || `${profile.displayName} — trainer at Apex Performance Club.`
      : `${profile.displayName}'s member profile at Apex Performance Club.`;

  return {
    title: `${profile.displayName} (@${profile.username})`,
    description,
    openGraph: { title: profile.displayName, description },
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const [profile, authUser] = await Promise.all([
    loadProfile(params.username),
    getServerAuthUser(),
  ]);

  if (!profile) {
    notFound();
  }

  // Ownership is only ever used here to show an "Edit profile" link — it
  // grants no extra data. The page renders the exact same PublicProfile
  // shape for the owner as for any other visitor; editing happens on the
  // separate, authenticated /dashboard/settings page.
  const isOwner = Boolean(authUser) && (await getProfileRepository().getProfile(authUser!.id))?.username.toLowerCase() === profile.username.toLowerCase();

  return (
    <PageContainer className="py-16 max-w-3xl space-y-6">
      <ProfileHeader profile={profile} isOwner={isOwner} />

      {isOwner ? (
        <div className="flex justify-end">
          <Link href="/dashboard/settings" className={buttonVariants({ variant: "outline", size: "sm" })}>
            Edit profile
          </Link>
        </div>
      ) : null}

      {profile.role === "trainer" ? <TrainerProfile profile={profile} /> : <MemberProfile profile={profile} />}
    </PageContainer>
  );
}
