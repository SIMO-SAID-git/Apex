"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

/**
 * Lazily creates a singleton Supabase browser client using only the public
 * URL/anon key (safe for client bundles). Uses @supabase/ssr's cookie-based
 * storage so the session is readable by Server Components, Route Handlers,
 * and middleware — not just localStorage. Returns null in mock mode or when
 * credentials are not configured, so callers must handle the null case.
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;

  if (!browserClient) {
    browserClient = createBrowserClient(url, anonKey);
  }

  return browserClient;
}
