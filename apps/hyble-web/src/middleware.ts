import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Panel routes require auth
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/organizations") ||
    pathname.startsWith("/wallet") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/projects") ||
    pathname.startsWith("/invoices") ||
    pathname.startsWith("/support")
  ) {
    // Check for session cookie
    const session = request.cookies.get("hyble_session");

    if (!session) {
      // Redirect to auth hub
      const redirectUrl = new URL("https://id.hyble.co/login");
      redirectUrl.searchParams.set("redirect", request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/organizations/:path*",
    "/wallet/:path*",
    "/settings/:path*",
    "/projects/:path*",
    "/invoices/:path*",
    "/support/:path*",
  ],
};
