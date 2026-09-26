import { NextRequest, NextResponse } from "next/server";
import { getServerAuthUser } from "@/lib/auth/session";
import { getProfileRepository } from "@/lib/services/profile-service";
import { getMembershipRepository } from "@/lib/services/membership-service";
import { changeMembershipTierSchema } from "@/lib/validations/membership-schema";

export async function GET() {
  const authUser = await getServerAuthUser();
  if (!authUser) {
    return NextResponse.json({ error: "Please sign in to view your membership.", code: "UNAUTHENTICATED" }, { status: 401 });
  }

  try {
    const history = await getMembershipRepository().getHistory(authUser.id);
    return NextResponse.json({ history });
  } catch (error) {
    console.error("[GET /api/membership]", error);
    return NextResponse.json({ error: "Unable to load membership history right now." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authUser = await getServerAuthUser();
  if (!authUser) {
    return NextResponse.json({ error: "Please sign in to change your membership.", code: "UNAUTHENTICATED" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = changeMembershipTierSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid membership tier." }, { status: 400 });
  }

  try {
    const profileRepository = getProfileRepository();
    const profile = await profileRepository.getProfile(authUser.id);

    if (profile?.role === "trainer") {
      return NextResponse.json(
        { error: "Trainer accounts already have full platform access and don't need a paid membership.", code: "FORBIDDEN" },
        { status: 403 }
      );
    }

    const event = await getMembershipRepository().changeTier(authUser.id, parsed.data.tier);
    const updatedProfile = await profileRepository.getProfile(authUser.id);
    return NextResponse.json({ event, profile: updatedProfile });
  } catch (error) {
    console.error("[POST /api/membership]", error);
    return NextResponse.json({ error: "Unable to update your membership right now." }, { status: 500 });
  }
}
