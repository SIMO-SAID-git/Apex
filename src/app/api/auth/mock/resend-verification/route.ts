import { NextRequest, NextResponse } from "next/server";
import { emailSchema } from "@/lib/validations/auth-schema";
import { getMockAuthStore } from "@/lib/auth/mock-auth-store";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = emailSchema.safeParse((body as { email?: unknown })?.email);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  const store = getMockAuthStore();
  const user = store.findByEmail(parsed.data);

  // Same generic-success shape as reset-password, for the same reason.
  // Mock mode has no real inbox to deliver to, so "resending" the
  // verification email is simulated by immediately marking the account
  // verified — this is what lets the rest of the flow (login → dashboard)
  // be exercised without a real mail provider. Production (Supabase) mode
  // uses SupabaseAuthService.resendVerificationEmail, which sends a real
  // email and does NOT auto-verify anything.
  if (user && !user.emailVerified) {
    store.markVerified(user.id);
  }

  return NextResponse.json({ success: true });
}
