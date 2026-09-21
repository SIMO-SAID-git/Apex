"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuthService } from "@/lib/auth/auth-service";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { authEvents } from "@/lib/auth/auth-events";
import { isMockMode } from "@/config/site";

const SESSION_QUERY_KEY = ["auth", "session"] as const;

/**
 * The single source of truth for "is anyone logged in, and as whom" on the
 * client. Session state itself is never duplicated into Zustand — this
 * query IS the state, kept fresh by push notifications (authEvents, and in
 * production also Supabase's own onAuthStateChange) rather than polling.
 */
export function useSession() {
  const queryClient = useQueryClient();
  const authService = getAuthService();

  const query = useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: () => authService.getSession(),
    staleTime: Infinity,
    gcTime: Infinity,
  });

  useEffect(() => {
    const unsubscribeLocal = authEvents.onChange(() => {
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
    });

    if (isMockMode) {
      return unsubscribeLocal;
    }

    const client = getSupabaseBrowserClient();
    if (!client) return unsubscribeLocal;

    const { data: listener } = client.auth.onAuthStateChange(() => {
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
    });

    return () => {
      unsubscribeLocal();
      listener.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient]);

  return query;
}

export { SESSION_QUERY_KEY };
