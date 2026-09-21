export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "EMAIL_ALREADY_REGISTERED"
  | "EMAIL_NOT_VERIFIED"
  | "WEAK_PASSWORD"
  | "USER_NOT_FOUND"
  | "RATE_LIMITED"
  | "NETWORK_ERROR"
  | "SESSION_EXPIRED"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "UNKNOWN";

export class AuthError extends Error {
  code: AuthErrorCode;
  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.name = "AuthError";
    this.code = code;
  }
}

const FRIENDLY_MESSAGES: Record<AuthErrorCode, string> = {
  INVALID_CREDENTIALS: "The email or password is incorrect.",
  EMAIL_ALREADY_REGISTERED: "An account with this email already exists. Try signing in instead.",
  EMAIL_NOT_VERIFIED: "Please verify your email before signing in. Check your inbox for the verification link.",
  WEAK_PASSWORD: "Please choose a stronger password (8+ characters, with an uppercase letter, lowercase letter, and a number).",
  USER_NOT_FOUND: "We couldn't find an account for that email.",
  RATE_LIMITED: "Too many attempts. Please wait a moment and try again.",
  NETWORK_ERROR: "We couldn't connect to the server. Please check your connection and try again.",
  SESSION_EXPIRED: "Your session has expired. Please sign in again.",
  UNAUTHENTICATED: "Please sign in to continue.",
  FORBIDDEN: "You don't have permission to do that.",
  UNKNOWN: "Something went wrong. Please try again.",
};

/**
 * Maps a raw Supabase/network/unknown error into a stable AuthErrorCode and a
 * friendly, safe-to-display message. Never surfaces raw provider error text
 * to the customer — that text is only ever logged server-side.
 */
export function mapAuthError(error: unknown): AuthError {
  if (error instanceof AuthError) return error;

  const rawMessage = error instanceof Error ? error.message : String(error);

  // Fast path: our own server code already returned a stable AuthErrorCode
  // (e.g. from a mock API route, or `throw new Error("UNAUTHENTICATED")`).
  const upper = rawMessage.trim().toUpperCase() as AuthErrorCode;
  if (upper in FRIENDLY_MESSAGES) {
    return new AuthError(upper, FRIENDLY_MESSAGES[upper]);
  }

  const lower = rawMessage.toLowerCase();

  if (lower.includes("invalid login credentials") || lower.includes("invalid_credentials")) {
    return new AuthError("INVALID_CREDENTIALS", FRIENDLY_MESSAGES.INVALID_CREDENTIALS);
  }
  if (lower.includes("already registered") || lower.includes("already exists") || lower.includes("user_already_exists")) {
    return new AuthError("EMAIL_ALREADY_REGISTERED", FRIENDLY_MESSAGES.EMAIL_ALREADY_REGISTERED);
  }
  if (lower.includes("email not confirmed") || lower.includes("not verified")) {
    return new AuthError("EMAIL_NOT_VERIFIED", FRIENDLY_MESSAGES.EMAIL_NOT_VERIFIED);
  }
  if (lower.includes("password") && (lower.includes("weak") || lower.includes("short") || lower.includes("least"))) {
    return new AuthError("WEAK_PASSWORD", FRIENDLY_MESSAGES.WEAK_PASSWORD);
  }
  if (lower.includes("user not found") || lower.includes("no user")) {
    return new AuthError("USER_NOT_FOUND", FRIENDLY_MESSAGES.USER_NOT_FOUND);
  }
  if (lower.includes("rate limit") || lower.includes("too many requests")) {
    return new AuthError("RATE_LIMITED", FRIENDLY_MESSAGES.RATE_LIMITED);
  }
  if (lower.includes("fetch failed") || lower.includes("network") || lower.includes("failed to fetch")) {
    return new AuthError("NETWORK_ERROR", FRIENDLY_MESSAGES.NETWORK_ERROR);
  }

  return new AuthError("UNKNOWN", FRIENDLY_MESSAGES.UNKNOWN);
}

export function friendlyAuthMessage(code: AuthErrorCode): string {
  return FRIENDLY_MESSAGES[code];
}
