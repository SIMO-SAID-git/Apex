import { NextResponse } from "next/server";
import { getProfileRepository } from "@/lib/services/profile-service";

/**
 * Intentionally unauthenticated — this is the public directory lookup used
 * by /profile/[username]. It can never return more than PublicProfile
 * (see types/profile.ts): no email, no phone, no internal ids. Safe to
 * call from anywhere, including from outside this app (a future mobile
 * client, search indexing, etc).
 */
export async function GET(_request: Request, { params }: { params: { username: string } }) {
  try {
    const repository = getProfileRepository();
    const profile = await repository.getPublicProfile(params.username);

    if (!profile) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("[GET /api/public-profiles/:username]", error);
    return NextResponse.json({ error: "Unable to load this profile right now." }, { status: 500 });
  }
}
