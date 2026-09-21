import { NextRequest, NextResponse } from "next/server";
import { passwordSchema } from "@/lib/validations/auth-schema";
import { getServerAuthUser } from "@/lib/auth/session";
import { getMockAuthStore } from "@/lib/auth/mock-auth-store";

export async function POST(request: NextRequest) {
  const authUser = await getServerAuthUser();
  if (!authUser) {
    return NextResponse.json({ error: "Please sign in again to update your password.", code: "UNAUTHENTICATED" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body.", code: "UNKNOWN" }, { status: 400 });
  }

  const parsed = passwordSchema.safeParse((body as { password?: unknown })?.password);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Weak password.", code: "WEAK_PASSWORD" }, { status: 400 });
  }

  getMockAuthStore().updatePassword(authUser.id, parsed.data);
  return NextResponse.json({ success: true });
}
