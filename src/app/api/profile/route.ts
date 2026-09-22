import { NextRequest, NextResponse } from "next/server";
import { getServerAuthUser } from "@/lib/auth/session";
import { getProfileRepository } from "@/lib/services/profile-service";
import { updateProfileSchema } from "@/lib/validations/profile-schema";

export async function GET() {
  const authUser = await getServerAuthUser();
  if (!authUser) {
    return NextResponse.json({ error: "Please sign in to view your profile.", code: "UNAUTHENTICATED" }, { status: 401 });
  }

  try {
    const repository = getProfileRepository();
    const profile = await repository.getProfile(authUser.id);
    return NextResponse.json({ profile });
  } catch (error) {
    console.error("[GET /api/profile]", error);
    return NextResponse.json({ error: "Unable to load your profile right now." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const authUser = await getServerAuthUser();
  if (!authUser) {
    return NextResponse.json({ error: "Please sign in to update your profile.", code: "UNAUTHENTICATED" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid profile data.", issues: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const repository = getProfileRepository();

    // Defense in depth: even though a member never has a trainer_details
    // row (see handle_new_user() in the migration) and RLS scopes any write
    // to the caller's own row regardless, we reject the request outright
    // rather than silently ignoring trainer data submitted by a non-trainer.
    if (parsed.data.trainer) {
      const existing = await repository.getProfile(authUser.id);
      if (existing?.role !== "trainer") {
        return NextResponse.json(
          { error: "Only trainer accounts can update trainer details.", code: "FORBIDDEN" },
          { status: 403 }
        );
      }
    }

    // authUser.id comes from the verified session, never from the request
    // body — a customer can only ever update their own row.
    const profile = await repository.updateProfile(authUser.id, parsed.data);
    return NextResponse.json({ profile });
  } catch (error) {
    console.error("[PATCH /api/profile]", error);
    return NextResponse.json({ error: "Unable to update your profile right now." }, { status: 500 });
  }
}
