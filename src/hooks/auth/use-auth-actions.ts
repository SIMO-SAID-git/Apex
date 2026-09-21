"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getAuthService } from "@/lib/auth/auth-service";
import { authEvents } from "@/lib/auth/auth-events";
import { mapAuthError, type AuthError } from "@/lib/auth/auth-errors";
import type { SignInInput, SignUpInput } from "@/types/auth";
import { sanitizeRedirectTarget } from "@/lib/auth/auth-redirects";

/**
 * The write side of authentication: every mutation a form can trigger, each
 * wrapped so components only ever see a friendly AuthError, never a raw
 * provider exception. Every action that changes who's logged in calls
 * authEvents.emit() so every mounted useSession()/useAuth() re-fetches
 * immediately.
 */
export function useAuthActions() {
  const authService = getAuthService();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  async function run<T>(action: () => Promise<T>): Promise<T | null> {
    setIsPending(true);
    setError(null);
    try {
      const result = await action();
      return result;
    } catch (err) {
      const mapped = mapAuthError(err);
      setError(mapped);
      return null;
    } finally {
      setIsPending(false);
    }
  }

  async function signUp(input: SignUpInput) {
    const result = await run(() => authService.signUp(input));
    if (result) authEvents.emit();
    return result;
  }

  async function signIn(input: SignInInput, redirectTo?: string) {
    const result = await run(() => authService.signIn(input));
    if (result) {
      authEvents.emit();
      router.push(sanitizeRedirectTarget(redirectTo));
      router.refresh();
    }
    return result;
  }

  async function signOut() {
    await run(() => authService.signOut());
    authEvents.emit();
    // Never leave another customer's private data cached for whoever uses
    // this browser/tab next.
    queryClient.removeQueries({ queryKey: ["profile"] });
    queryClient.removeQueries({ queryKey: ["bookings"] });
    queryClient.removeQueries({ queryKey: ["auth"] });
    router.push("/");
    router.refresh();
  }

  async function resetPassword(email: string) {
    return run(() => authService.resetPassword(email));
  }

  async function updatePassword(password: string) {
    const result = await run(() => authService.updatePassword(password));
    return result !== null;
  }

  async function resendVerificationEmail(email: string) {
    return run(() => authService.resendVerificationEmail(email));
  }

  async function signInWithOAuth(provider: "google") {
    if (!authService.signInWithOAuth) return;
    await run(() => authService.signInWithOAuth!(provider));
  }

  const isGoogleConfigured = authService.isOAuthConfigured("google");

  return {
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    resendVerificationEmail,
    signInWithOAuth,
    isGoogleConfigured,
    isPending,
    error,
    clearError: () => setError(null),
  };
}
