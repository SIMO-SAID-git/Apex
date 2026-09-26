import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/lib/auth/session";
import { getProfileRepository } from "@/lib/services/profile-service";

/**
 * BUG FIX: "/profile" 404'd because only the dynamic "/profile/[username]"
 * segment existed — nothing handled the bare route a nav link, bookmark, or
 * "My Profile" click would naturally point at. This resolves the signed-in
 * customer's own username server-side and redirects to their real profile
 * URL; a signed-out visitor is sent to log in first, then back here.
 */
export default async function ProfileIndexPage() {
  const authUser = await getServerAuthUser();

  if (!authUser) {
    redirect("/login?redirect=/profile");
  }

  const profile = await getProfileRepository().getProfile(authUser.id);

  if (!profile) {
    redirect("/dashboard/settings");
  }

  redirect(`/profile/${profile.username}`);
}
