import { NextResponse } from "next/server";
import { getServerAuthUser } from "@/lib/auth/session";
import { getMockAuthStore } from "@/lib/auth/mock-auth-store";
import type { AuthSession } from "@/types/auth";

export async function GET() {
  const authUser = await getServerAuthUser();
  if (!authUser) {
    return NextResponse.json({ session: null });
  }

  const user = getMockAuthStore().findById(authUser.id);
  if (!user) {
    return NextResponse.json({ session: null });
  }

  const session: AuthSession = {
    user: { id: user.id, email: user.email, emailVerified: user.emailVerified, createdAt: user.createdAt },
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
  };

  return NextResponse.json({ session });
}
