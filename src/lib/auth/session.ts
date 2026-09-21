import "server-only";
import { cookies } from "next/headers";
import { isMockMode } from "@/config/site";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { MOCK_SESSION_COOKIE, decodeMockSession } from "@/lib/auth/mock-session";
import { getMockAuthStore } from "@/lib/auth/mock-auth-store";

export interface ServerAuthUser {
  id: string;
  email: string;
}

/**
 * THE single function every protected Server Component, Server Action, and
 * Route Handler calls to find out who is making the request. It NEVER
 * trusts a client-supplied user id (from a request body or query string) —
 * it only ever derives identity from the session cookie (mock mode) or the
 * Supabase-managed session cookie (production), both of which are set
 * server-side and are httpOnly.
 */
export async function getServerAuthUser(): Promise<ServerAuthUser | null> {
  if (isMockMode) {
    const cookieValue = cookies().get(MOCK_SESSION_COOKIE)?.value;
    const userId = decodeMockSession(cookieValue);
    if (!userId) return null;

    const user = getMockAuthStore().findById(userId);
    if (!user) return null;

    return { id: user.id, email: user.email };
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) return null;

  return { id: user.id, email: user.email };
}

/** Convenience helper for routes that should 401 rather than branch on null. */
export async function requireServerAuthUser(): Promise<ServerAuthUser> {
  const user = await getServerAuthUser();
  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }
  return user;
}
