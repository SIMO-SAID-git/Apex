"use client";

import { useSession } from "@/hooks/auth/use-session";
import { useProfile } from "@/hooks/auth/use-profile";
import type { AuthState } from "@/types/auth";

/**
 * The umbrella hook most components should reach for: combines session +
 * profile into the single AuthState shape the rest of the app consumes
 * (account menu, protected UI gates, booking flow, settings page).
 */
export function useAuth(): AuthState {
  const { data: session, isLoading: isLoadingSession } = useSession();
  const { data: profile, isLoading: isLoadingProfile } = useProfile();

  return {
    user: session?.user ?? null,
    profile: profile ?? null,
    session: session ?? null,
    isLoading: isLoadingSession || (Boolean(session) && isLoadingProfile),
    isAuthenticated: Boolean(session?.user),
  };
}
