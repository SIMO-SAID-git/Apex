"use client";

/**
 * Minimal pub/sub so any number of mounted `useSession()` hooks can react
 * immediately to a sign-in/sign-up/sign-out/password-update happening
 * elsewhere in the tree, without putting session state in Zustand (auth
 * state's source of truth stays the provider — Supabase or the mock cookie —
 * per the architectural rule in docs/authentication.md). Mirrors how
 * RealtimeAdapter pushes updates into the TanStack Query cache elsewhere in
 * this codebase.
 */
class AuthEvents extends EventTarget {
  emit() {
    this.dispatchEvent(new Event("change"));
  }
  onChange(callback: () => void): () => void {
    this.addEventListener("change", callback);
    return () => this.removeEventListener("change", callback);
  }
}

export const authEvents = new AuthEvents();
