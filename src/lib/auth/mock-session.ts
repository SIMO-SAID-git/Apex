import "server-only";

export const MOCK_SESSION_COOKIE = "apex_mock_session";

interface MockSessionPayload {
  userId: string;
}

/**
 * Deliberately simple, deliberately NOT cryptographically signed. This
 * exists purely so mock/dev mode can exercise the full auth UI (protected
 * routes, middleware, "who am I" checks) without a real backend. It is only
 * ever read/written when NEXT_PUBLIC_USE_MOCK_DATA !== "false", and it must
 * never be treated as a template for production session handling — the
 * production path (SupabaseAuthService + @supabase/ssr) uses signed,
 * httpOnly, provider-managed cookies instead.
 */
export function encodeMockSession(userId: string): string {
  const payload: MockSessionPayload = { userId };
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

export function decodeMockSession(cookieValue: string | undefined | null): string | null {
  if (!cookieValue) return null;
  try {
    const payload = JSON.parse(Buffer.from(cookieValue, "base64url").toString("utf-8")) as MockSessionPayload;
    return payload.userId ?? null;
  } catch {
    return null;
  }
}

export const MOCK_SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30, // 30 days
};
