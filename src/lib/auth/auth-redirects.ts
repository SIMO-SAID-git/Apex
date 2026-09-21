const DEFAULT_REDIRECT = "/dashboard";

/**
 * Only ever allow same-origin, relative redirect targets. Without this
 * check, a `?redirect=https://evil.example.com` query param would turn the
 * login page into an open redirect.
 */
export function sanitizeRedirectTarget(target: string | null | undefined): string {
  if (!target) return DEFAULT_REDIRECT;
  if (!target.startsWith("/") || target.startsWith("//")) return DEFAULT_REDIRECT;
  return target;
}

/**
 * Builds the URL an unauthenticated customer is sent to, preserving both the
 * page they were on and any in-flight booking context (e.g. a class id
 * selected before the auth gate). Both are plain query params, never
 * anything sensitive.
 */
export function buildLoginRedirectUrl(pathname: string, extraParams?: Record<string, string>): string {
  const params = new URLSearchParams();
  params.set("redirect", pathname);
  if (extraParams) {
    for (const [key, value] of Object.entries(extraParams)) {
      if (value) params.set(key, value);
    }
  }
  return `/login?${params.toString()}`;
}

/** Re-attaches a preserved classId (if any) to the sanitized redirect target. */
export function appendClassIdParam(redirectTarget: string, classId: string | null): string {
  if (!classId) return redirectTarget;
  const separator = redirectTarget.includes("?") ? "&" : "?";
  return `${redirectTarget}${separator}classId=${encodeURIComponent(classId)}`;
}
