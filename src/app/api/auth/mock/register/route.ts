import { NextRequest, NextResponse } from "next/server";
import { registerServerSchema } from "@/lib/validations/auth-schema";
import { getMockAuthStore } from "@/lib/auth/mock-auth-store";
import { createMockProfile } from "@/lib/services/profile-service";
import type { AuthResult } from "@/types/auth";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body.", code: "UNKNOWN" }, { status: 400 });
  }

  const parsed = registerServerSchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json(
      { error: firstIssue?.message ?? "Invalid registration data.", code: "WEAK_PASSWORD", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const store = getMockAuthStore();
  const existing = store.findByEmail(parsed.data.email);
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists.", code: "EMAIL_ALREADY_REGISTERED" },
      { status: 409 }
    );
  }

  const user = store.create(parsed.data);
  createMockProfile({
    userId: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  });

  // Mock mode never sends real email — the customer is treated as
  // "pending verification" and must visit /verify-email, matching the
  // production UX shape, but no session is issued until they "verify"
  // (simulated by the resend-verification route, matching how a real
  // confirmation link would flip this flag).
  const result: AuthResult = {
    user: { id: user.id, email: user.email, emailVerified: false, createdAt: user.createdAt },
    session: null,
    requiresEmailConfirmation: true,
  };

  return NextResponse.json(result, { status: 201 });
}
