import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files and API routes
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check for session token (both secure and non-secure versions)
  const sessionToken =
    request.cookies.get("__Secure-authjs.session-token")?.value ||
    request.cookies.get("authjs.session-token")?.value;

  const isLoggedIn = !!sessionToken;

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/verify-2fa") ||
    pathname.startsWith("/verify-email");

  const isPublicRoute = pathname === "/";

  // Redirect logged-in users away from auth pages (except verify-2fa)
  // verify-2fa needs to be accessible even with a partial session
  if (isAuthPage && isLoggedIn && !pathname.startsWith("/verify-2fa")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protect private routes
  if (!isLoggedIn && !isAuthPage && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
