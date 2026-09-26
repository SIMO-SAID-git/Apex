import { NextResponse } from "next/server";
import { getServerAuthUser } from "@/lib/auth/session";
import { getNotificationRepository } from "@/lib/services/notification-service";

export async function POST() {
  const authUser = await getServerAuthUser();
  if (!authUser) {
    return NextResponse.json({ error: "Please sign in.", code: "UNAUTHENTICATED" }, { status: 401 });
  }

  await getNotificationRepository().markAllAsRead(authUser.id);
  return NextResponse.json({ success: true });
}
