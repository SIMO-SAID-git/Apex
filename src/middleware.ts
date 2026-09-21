import { NextResponse, type NextRequest } from "next/server";
import { isMockMode } from "@/config/site";
import { refreshSupabaseSession } from "@/lib/supabase/middleware";
import { MOCK_SESSION_COOKIE, decodeMockSession } from "@/lib/auth/mock-session";

const PROTECTED_PREFIXES = ["/dashboard"];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    // Public routes (/, /classes, /facilities, /membership, /login,
    // /register, /forgot-password, /reset-password, /verify-email) are
    // intentionally excluded from the matcher below and never reach here,
    // but this early return keeps the guard explicit and safe if the
    // matcher is ever loosened.
    return NextResponse.next();
  }

  if (isMockMode) {
    const cookieValue = request.cookies.get(MOCK_SESSION_COOKIE)?.value;
    const userId = decodeMockSession(cookieValue);

    if (!userId) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  const { response, userId } = await refreshSupabaseSession(request);

  if (!userId) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
