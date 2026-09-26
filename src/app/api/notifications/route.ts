import { NextResponse } from "next/server";
import { getServerAuthUser } from "@/lib/auth/session";
import { getNotificationRepository } from "@/lib/services/notification-service";

export async function GET() {
  const authUser = await getServerAuthUser();
  if (!authUser) {
    return NextResponse.json({ error: "Please sign in.", code: "UNAUTHENTICATED" }, { status: 401 });
  }

  try {
    const notifications = await getNotificationRepository().getForUser(authUser.id);
    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("[GET /api/notifications]", error);
    return NextResponse.json({ error: "Unable to load notifications right now." }, { status: 500 });
  }
}
