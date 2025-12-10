import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { generateRequestId } from "@/lib/middleware/logging";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const startTime = Date.now();

  // Generate request ID for tracing
  const requestId = request.headers.get("x-request-id") || generateRequestId();

  // Skip static files
  if (
    pathname.startsWith("/_next/") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // API route handling
  if (pathname.startsWith("/api/")) {
    const response = NextResponse.next();

    // Add request ID
    response.headers.set("X-Request-Id", requestId);

    // Add security headers for API routes
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");

    // CORS headers for API routes
    const origin = request.headers.get("origin");
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "https://hyble.io",
      "https://panel.hyble.io",
      "https://mineble.io",
      "https://panel.mineble.io",
    ];

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Credentials", "true");
      response.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE, OPTIONS"
      );
      response.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With, X-API-Key, X-CSRF-Token"
      );
    }

    // Handle preflight
    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: response.headers,
      });
    }

    // Log API request duration
    const duration = Date.now() - startTime;
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[${requestId.slice(0, 8)}] ${request.method} ${pathname} - ${duration}ms`
      );
    }

    return response;
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

  const isPublicRoute = pathname === "/" || pathname === "/pricing" || pathname === "/about";

  // Create response with security headers
  const createSecureResponse = (response: NextResponse) => {
    // Add request ID
    response.headers.set("X-Request-Id", requestId);

    // Security headers
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "SAMEORIGIN");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

    // HSTS in production
    if (process.env.NODE_ENV === "production") {
      response.headers.set(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains"
      );
    }

    return response;
  };

  // Redirect logged-in users away from auth pages (except verify-2fa)
  if (isAuthPage && isLoggedIn && !pathname.startsWith("/verify-2fa")) {
    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    return createSecureResponse(response);
  }

  // Protect private routes
  if (!isLoggedIn && !isAuthPage && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    const response = NextResponse.redirect(loginUrl);
    return createSecureResponse(response);
  }

  const response = NextResponse.next();
  return createSecureResponse(response);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
