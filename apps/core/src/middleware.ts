import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { generateRequestId } from "@/lib/middleware/logging";
import { validateCsrfToken, checkIpSecurity } from "@/lib/middleware/security";

// CSRF-protected paths (state-changing operations)
const CSRF_PROTECTED_PATHS = [
  "/api/auth/",
  "/api/users/",
  "/api/admin/",
  "/api/billing/",
  "/api/wallet/",
  "/api/settings/",
];

// Auth paths excluded from CSRF (logout needs to work without CSRF)
const AUTH_CSRF_EXCLUDED = [
  "/api/auth/logout",
  "/api/auth/callback",
  "/api/auth/csrf",
  "/api/auth/session",
  "/api/auth/providers",
  "/api/auth/signin",
  "/api/auth/signout",
];

// Paths excluded from CSRF (webhooks, public APIs)
const CSRF_EXCLUDED_PATHS = [
  "/api/webhooks/",
  "/api/cron/",
  "/api/trpc",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";
  const startTime = Date.now();

  // Generate request ID for tracing
  const requestId = request.headers.get("x-request-id") || generateRequestId();

  // IP Security Check
  const ipCheck = checkIpSecurity(request);
  if (!ipCheck.allowed) {
    return NextResponse.json(
      { error: "Access denied", reason: ipCheck.reason },
      { status: 403, headers: { "X-Request-Id": requestId } }
    );
  }

  // Skip static files
  if (
    pathname.startsWith("/_next/") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Host-based routing for secret.hyble.net (Admin Panel)
  if (host.includes("secret.hyble.net")) {
    // secret.hyble.net should only access /admin routes
    if (!pathname.startsWith("/admin") && !pathname.startsWith("/api") && !pathname.startsWith("/login") && pathname !== "/logout" && pathname !== "/") {
      // Redirect non-admin routes to /admin
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    // Root path redirects to /admin
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // Host-based routing for id.hyble.co (Auth Hub + Account Management)
  if (host.includes("id.hyble.co") || host.includes("localhost:3000")) {
    const sessionToken =
      request.cookies.get("__Secure-authjs.session-token")?.value ||
      request.cookies.get("authjs.session-token")?.value;

    // Root path: logged-in users go to account, guests go to login
    if (pathname === "/") {
      if (sessionToken) {
        return NextResponse.redirect(new URL("/account", request.url));
      } else {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }

    // Redirect old dashboard routes to account
    if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
      if (sessionToken) {
        return NextResponse.redirect(new URL("/account", request.url));
      } else {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }

    // Redirect old settings routes to account with section param
    if (pathname === "/settings" || pathname === "/settings/security") {
      return NextResponse.redirect(new URL("/account?section=security", request.url));
    }
    if (pathname === "/settings/sessions") {
      return NextResponse.redirect(new URL("/account?section=sessions", request.url));
    }
    if (pathname === "/settings/notifications") {
      return NextResponse.redirect(new URL("/account?section=profile", request.url));
    }
  }

  // Host-based routing for console.hyble.co (User Dashboard)
  if (host.includes("console.hyble.co") || host.includes("panel.hyble.co")) {
    // console.hyble.co should access /dashboard routes
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    // Block /admin access from console.hyble.co
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    // Redirect settings to id.hyble.co/account
    if (pathname === "/settings" || pathname.startsWith("/settings/")) {
      const idUrl = process.env.NODE_ENV === "production"
        ? "https://id.hyble.co/account"
        : "http://localhost:3000/account";
      return NextResponse.redirect(new URL(idUrl));
    }
  }

  // API route handling
  if (pathname.startsWith("/api/")) {
    // CSRF Token Validation for protected paths
    const needsCsrf = CSRF_PROTECTED_PATHS.some(path => pathname.startsWith(path));
    const isExcluded = CSRF_EXCLUDED_PATHS.some(path => pathname.startsWith(path));
    const isAuthExcluded = AUTH_CSRF_EXCLUDED.some(path => pathname.startsWith(path));

    if (needsCsrf && !isExcluded && !isAuthExcluded && !validateCsrfToken(request)) {
      return NextResponse.json(
        { error: "Invalid or missing CSRF token" },
        { status: 403, headers: { "X-Request-Id": requestId } }
      );
    }

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
    pathname === "/logout" ||
    pathname === "/auth/login" ||
    pathname === "/auth/register" ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/verify-2fa") ||
    pathname.startsWith("/verify-email");

  // Check if user just logged out (don't redirect them away from login page)
  const justLoggedOut = request.nextUrl.searchParams.get("logout") === "success";

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

  // Allow logout page to proceed without redirect (user is actively signing out)
  if (pathname === "/logout") {
    const response = NextResponse.next();
    return createSecureResponse(response);
  }

  // Redirect logged-in users away from auth pages (except verify-2fa and logout success)
  // Note: /logout is handled above, so it won't reach here
  // Don't redirect if user just logged out - let them see the login page with success message
  if (isAuthPage && isLoggedIn && !pathname.startsWith("/verify-2fa") && !justLoggedOut) {
    const response = NextResponse.redirect(new URL("/account", request.url));
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
