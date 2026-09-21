/**
 * Provider-agnostic auth types. Deliberately NOT a re-export of
 * @supabase/supabase-js's `User`/`Session` — the whole point of the
 * AuthService abstraction (lib/auth/auth-service.ts) is that UI code and
 * hooks never import supabase-js types directly, so a future provider swap
 * (or adding Google/OAuth) never touches component code. SupabaseAuthService
 * maps supabase-js's User/Session into these shapes at the boundary.
 */
export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface AuthSession {
  user: AuthUser;
  /** Epoch ms when the current access token expires. Informational only —
   *  refresh is handled transparently by the underlying provider/middleware. */
  expiresAt: number;
}

export interface AuthState {
  user: AuthUser | null;
  profile: import("./profile").CustomerProfile | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface SignUpInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface AuthResult {
  user: AuthUser | null;
  session: AuthSession | null;
  /** True when the account was created but requires email confirmation
   *  before a session is issued (standard Supabase email/password flow). */
  requiresEmailConfirmation: boolean;
}

export type OAuthProvider = "google";
