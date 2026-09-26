import { NextResponse } from "next/server";
import { getServerAuthUser } from "@/lib/auth/session";
import { getNotificationRepository } from "@/lib/services/notification-service";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const authUser = await getServerAuthUser();
  if (!authUser) {
    return NextResponse.json({ error: "Please sign in.", code: "UNAUTHENTICATED" }, { status: 401 });
  }

  await getNotificationRepository().markAsRead(authUser.id, params.id);
  return NextResponse.json({ success: true });
}
