import { NextRequest, NextResponse } from "next/server";
import { emailSchema } from "@/lib/validations/auth-schema";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = emailSchema.safeParse((body as { email?: unknown })?.email);

  // Always return success shape regardless of whether the email is
  // registered — this is what prevents account enumeration via this
  // endpoint. Mock mode has no real email to send, so this is a no-op
  // beyond validating the input shape.
  if (parsed.success) {
    // In a real deployment this simulates "queue the reset email"; nothing
    // to actually send in mock mode.
  }

  return NextResponse.json({ success: true });
}
