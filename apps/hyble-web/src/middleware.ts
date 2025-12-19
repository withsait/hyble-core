import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // Handle game.hyble.co subdomain
  if (hostname.startsWith("game.") || hostname.startsWith("game.localhost")) {
    // Rewrite to /game routes
    if (pathname === "/") {
      return NextResponse.rewrite(new URL("/game", request.url));
    }
    // For other paths under game subdomain
    if (!pathname.startsWith("/game") && !pathname.startsWith("/_next") && !pathname.startsWith("/api")) {
      return NextResponse.rewrite(new URL(`/game${pathname}`, request.url));
    }
  }

  // Panel routes require auth
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/organizations") ||
    pathname.startsWith("/wallet") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/websites") ||
    pathname.startsWith("/invoices") ||
    pathname.startsWith("/support")
  ) {
    // Check for NextAuth session cookie (shared across .hyble.co subdomains)
    const sessionToken =
      request.cookies.get("__Secure-authjs.session-token")?.value ||
      request.cookies.get("authjs.session-token")?.value;

    if (!sessionToken) {
      // Redirect to auth hub with callback URL
      const redirectUrl = new URL("https://id.hyble.co/login");
      redirectUrl.searchParams.set("callbackUrl", request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/organizations/:path*",
    "/wallet/:path*",
    "/settings/:path*",
    "/websites/:path*",
    "/invoices/:path*",
    "/support/:path*",
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
