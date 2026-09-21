import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { loginSchema } from "@/lib/validations/auth-schema";
import { getMockAuthStore } from "@/lib/auth/mock-auth-store";
import { encodeMockSession, MOCK_SESSION_COOKIE, MOCK_SESSION_COOKIE_OPTIONS } from "@/lib/auth/mock-session";
import type { AuthResult } from "@/types/auth";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body.", code: "UNKNOWN" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email and password.", code: "INVALID_CREDENTIALS" }, { status: 400 });
  }

  const store = getMockAuthStore();
  const user = store.findByEmail(parsed.data.email);

  // Deliberately identical error for "no such user" and "wrong password" —
  // distinguishing them would let an attacker enumerate registered emails.
  if (!user || user.password !== parsed.data.password) {
    return NextResponse.json({ error: "The email or password is incorrect.", code: "INVALID_CREDENTIALS" }, { status: 401 });
  }

  if (!user.emailVerified) {
    return NextResponse.json(
      { error: "Please verify your email before signing in.", code: "EMAIL_NOT_VERIFIED" },
      { status: 403 }
    );
  }

  cookies().set(MOCK_SESSION_COOKIE, encodeMockSession(user.id), MOCK_SESSION_COOKIE_OPTIONS);

  const result: AuthResult = {
    user: { id: user.id, email: user.email, emailVerified: true, createdAt: user.createdAt },
    session: { user: { id: user.id, email: user.email, emailVerified: true, createdAt: user.createdAt }, expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 },
    requiresEmailConfirmation: false,
  };

  return NextResponse.json(result);
}
