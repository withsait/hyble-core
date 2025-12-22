// Next.js auth middleware
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export interface AuthMiddlewareConfig {
  protectedRoutes?: string[];
  publicRoutes?: string[];
  loginUrl?: string;
  afterLoginUrl?: string;
}

const defaultConfig: AuthMiddlewareConfig = {
  protectedRoutes: ["/dashboard", "/settings", "/console"],
  publicRoutes: ["/", "/login", "/register", "/forgot-password"],
  loginUrl: "/login",
  afterLoginUrl: "/dashboard",
};

export function createAuthMiddleware(config: AuthMiddlewareConfig = {}) {
  const mergedConfig = { ...defaultConfig, ...config };

  return async function authMiddleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Get the token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: "hyble_session",
    });

    const isAuthenticated = !!token;

    // Check if the route is protected
    const isProtectedRoute = mergedConfig.protectedRoutes?.some((route) =>
      pathname.startsWith(route)
    );

    // Check if the route is public
    const isPublicRoute = mergedConfig.publicRoutes?.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    );

    // Redirect to login if accessing protected route without auth
    if (isProtectedRoute && !isAuthenticated) {
      const loginUrl = new URL(mergedConfig.loginUrl!, request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Redirect to dashboard if accessing login while authenticated
    if (
      (pathname === "/login" || pathname === "/register") &&
      isAuthenticated
    ) {
      return NextResponse.redirect(
        new URL(mergedConfig.afterLoginUrl!, request.url)
      );
    }

    return NextResponse.next();
  };
}

export { getToken };
