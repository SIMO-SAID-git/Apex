import { NextResponse } from "next/server";
import { getServerAuthUser } from "@/lib/auth/session";
import { getActivityStats } from "@/lib/services/activity-stats-service";

export async function GET() {
  const authUser = await getServerAuthUser();
  if (!authUser) {
    return NextResponse.json({ error: "Please sign in.", code: "UNAUTHENTICATED" }, { status: 401 });
  }

  try {
    const stats = await getActivityStats(authUser.id);
    return NextResponse.json(stats);
  } catch (error) {
    console.error("[GET /api/dashboard/activity-stats]", error);
    return NextResponse.json({ error: "Unable to load activity stats right now." }, { status: 500 });
  }
}
