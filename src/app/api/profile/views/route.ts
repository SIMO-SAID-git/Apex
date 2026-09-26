import { NextResponse } from "next/server";
import { getServerAuthUser } from "@/lib/auth/session";
import { getProfileViewStats } from "@/lib/services/profile-view-service";

export async function GET() {
  const authUser = await getServerAuthUser();
  if (!authUser) {
    return NextResponse.json({ error: "Please sign in.", code: "UNAUTHENTICATED" }, { status: 401 });
  }

  try {
    const stats = await getProfileViewStats(authUser.id);
    return NextResponse.json(stats);
  } catch (error) {
    console.error("[GET /api/profile/views]", error);
    return NextResponse.json({ error: "Unable to load view stats right now." }, { status: 500 });
  }
}
