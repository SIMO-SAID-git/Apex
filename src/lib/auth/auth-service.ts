"use client";

import type { AuthResult, AuthSession, AuthUser, SignInInput, SignUpInput } from "@/types/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { apiRequest, ApiError } from "@/lib/api/client";
import { mapAuthError, AuthError } from "@/lib/auth/auth-errors";
import { isMockMode } from "@/config/site";
import { siteConfig } from "@/config/site";

/**
 * Everything the UI needs from an identity provider. Hooks depend on this
 * interface only — never on `@supabase/supabase-js` or on the mock fetch
 * calls directly — so adding a provider (Google OAuth today, something else
 * tomorrow) or swapping Supabase for another backend never touches a
 * component.
 */
export interface AuthService {
  signUp(input: SignUpInput): Promise<AuthResult>;
  signIn(input: SignInInput): Promise<AuthResult>;
  signOut(): Promise<void>;
  getSession(): Promise<AuthSession | null>;
  getCurrentUser(): Promise<AuthUser | null>;
  resetPassword(email: string): Promise<void>;
  updatePassword(password: string): Promise<void>;
  resendVerificationEmail(email: string): Promise<void>;
  /** Returns null if the provider (or this build) doesn't support the given OAuth provider yet. */
  signInWithOAuth?(provider: "google"): Promise<void>;
  isOAuthConfigured(provider: "google"): boolean;
}

function toAuthUser(supabaseUser: { id: string; email?: string | null; email_confirmed_at?: string | null; created_at: string }): AuthUser {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? "",
    emailVerified: Boolean(supabaseUser.email_confirmed_at),
    createdAt: supabaseUser.created_at,
  };
}

export class SupabaseAuthService implements AuthService {
  private client() {
    const client = getSupabaseBrowserClient();
    if (!client) {
      throw new AuthError("UNKNOWN", "Supabase is not configured in this environment.");
    }
    return client;
  }

  async signUp(input: SignUpInput): Promise<AuthResult> {
    try {
      const { data, error } = await this.client().auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: { first_name: input.firstName, last_name: input.lastName, role: input.role ?? "member" },
          emailRedirectTo: `${siteConfig.url}/auth/callback?next=/dashboard`,
        },
      });
      if (error) throw error;

      const user = data.user ? toAuthUser(data.user) : null;
      return {
        user,
        session: null, // A session is only issued once the email is confirmed.
        requiresEmailConfirmation: Boolean(user && !user.emailVerified),
      };
    } catch (error) {
      throw mapAuthError(error);
    }
  }

  async signIn(input: SignInInput): Promise<AuthResult> {
    try {
      const { data, error } = await this.client().auth.signInWithPassword(input);
      if (error) throw error;

      const user = data.user ? toAuthUser(data.user) : null;
      return {
        user,
        session: data.session ? { user: user!, expiresAt: data.session.expires_at ? data.session.expires_at * 1000 : Date.now() } : null,
        requiresEmailConfirmation: false,
      };
    } catch (error) {
      throw mapAuthError(error);
    }
  }

  async signOut(): Promise<void> {
    const { error } = await this.client().auth.signOut();
    if (error) throw mapAuthError(error);
  }

  async getSession(): Promise<AuthSession | null> {
    const { data } = await this.client().auth.getSession();
    if (!data.session?.user) return null;
    return {
      user: toAuthUser(data.session.user),
      expiresAt: data.session.expires_at ? data.session.expires_at * 1000 : Date.now(),
    };
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const { data } = await this.client().auth.getUser();
    return data.user ? toAuthUser(data.user) : null;
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await this.client().auth.resetPasswordForEmail(email, {
      redirectTo: `${siteConfig.url}/auth/callback?next=/reset-password`,
    });
    if (error) throw mapAuthError(error);
  }

  async updatePassword(password: string): Promise<void> {
    const { error } = await this.client().auth.updateUser({ password });
    if (error) throw mapAuthError(error);
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const { error } = await this.client().auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${siteConfig.url}/auth/callback?next=/dashboard` },
    });
    if (error) throw mapAuthError(error);
  }

  async signInWithOAuth(provider: "google"): Promise<void> {
    const { error } = await this.client().auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${siteConfig.url}/auth/callback?next=/dashboard` },
    });
    if (error) throw mapAuthError(error);
  }

  isOAuthConfigured(): boolean {
    // Supabase itself doesn't expose which providers are enabled to the
    // client. Configuring Google requires setting up an OAuth app in the
    // Supabase dashboard; until that's done, calling signInWithOAuth would
    // fail with a provider-not-enabled error. We surface that as "not
    // configured" via this explicit flag rather than pretending it works.
    return process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED === "true";
  }
}

/**
 * Talks to our own /api/auth/mock/* route handlers, which are the only code
 * allowed to set the httpOnly mock session cookie (a browser-side service
 * can't set httpOnly cookies directly). Kept behind the same interface as
 * SupabaseAuthService so every hook/component is provider-agnostic.
 */
export class MockAuthService implements AuthService {
  async signUp(input: SignUpInput): Promise<AuthResult> {
    try {
      return await apiRequest<AuthResult>("/api/auth/mock/register", {
        method: "POST",
        body: JSON.stringify(input),
      });
    } catch (error) {
      throw this.mapApiError(error);
    }
  }

  async signIn(input: SignInInput): Promise<AuthResult> {
    try {
      return await apiRequest<AuthResult>("/api/auth/mock/login", {
        method: "POST",
        body: JSON.stringify(input),
      });
    } catch (error) {
      throw this.mapApiError(error);
    }
  }

  async signOut(): Promise<void> {
    await apiRequest("/api/auth/mock/logout", { method: "POST", parseJson: false });
  }

  async getSession(): Promise<AuthSession | null> {
    const data = await apiRequest<{ session: AuthSession | null }>("/api/auth/mock/session");
    return data.session;
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const session = await this.getSession();
    return session?.user ?? null;
  }

  async resetPassword(email: string): Promise<void> {
    await apiRequest("/api/auth/mock/reset-password", {
      method: "POST",
      body: JSON.stringify({ email }),
      parseJson: false,
    });
  }

  async updatePassword(password: string): Promise<void> {
    try {
      await apiRequest("/api/auth/mock/update-password", {
        method: "POST",
        body: JSON.stringify({ password }),
        parseJson: false,
      });
    } catch (error) {
      throw this.mapApiError(error);
    }
  }

  async resendVerificationEmail(email: string): Promise<void> {
    await apiRequest("/api/auth/mock/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
      parseJson: false,
    });
  }

  isOAuthConfigured(): boolean {
    return false;
  }

  private mapApiError(error: unknown): AuthError {
    if (error instanceof ApiError) {
      if (error.code) return mapAuthError(new Error(error.code));
      return mapAuthError(new Error(error.message));
    }
    return mapAuthError(error);
  }
}

let cachedService: AuthService | null = null;

export function getAuthService(): AuthService {
  if (!cachedService) {
    cachedService = isMockMode ? new MockAuthService() : new SupabaseAuthService();
  }
  return cachedService;
}
