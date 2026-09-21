import "server-only";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Session-aware server client, bound to the current request's cookies via
 * next/headers. This is what Server Components, Server Actions, and Route
 * Handlers use to find out "who is logged in" and to query RLS-protected
 * tables (e.g. `profiles`) AS that user — RLS is enforced by Postgres, not
 * by application code, so queries made with this client can only ever see
 * rows the policies allow.
 *
 * Returns null when Supabase isn't configured (mock mode) — callers fall
 * back to the mock session cookie instead (see lib/auth/session.ts).
 */
export function getSupabaseServerClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;

  const cookieStore = cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      // Server Components can't write cookies (Next.js restriction) — writes
      // are a no-op here and instead happen in middleware.ts, which runs on
      // every request and refreshes the session cookie before the Server
      // Component tree renders.
      set(_name: string, _value: string, _options: CookieOptions) {},
      remove(_name: string, _options: CookieOptions) {},
    },
  });
}

/**
 * Privileged, service-role client. Bypasses Row Level Security entirely —
 * used ONLY for administrative operations that a normal authenticated user
 * could never do for themselves, such as deleting an auth user during
 * account deletion. Never import this from a "use client" component; the
 * `server-only` import above throws a build error if that happens, and this
 * function additionally requires SUPABASE_SERVICE_ROLE_KEY, which must never
 * be prefixed with NEXT_PUBLIC_ or otherwise reach the browser bundle.
 */
export function getSupabaseServiceRoleClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) return null;

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
