import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Domain to route group mapping
const DOMAIN_ROUTES: Record<string, string> = {
  // God Panel (Admin only)
  "dev.hyble.net": "/admin",
  "localhost:3000": "/admin", // Local development

  // Auth Hub (All users)
  "id.hyble.co": "/auth",

  // API
  "api.hyble.co": "/api",
};

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  // Skip internal Next.js routes and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".") // static files
  ) {
    return NextResponse.next();
  }

  // Find matching domain
  let routePrefix = "";
  for (const [domain, prefix] of Object.entries(DOMAIN_ROUTES)) {
    if (host.includes(domain.split(":")[0])) {
      routePrefix = prefix;
      break;
    }
  }

  // If no specific domain matched, default to auth for id.hyble.co pattern
  // or admin for dev/ops pattern
  if (!routePrefix) {
    if (host.includes("id.")) {
      routePrefix = "/auth";
    } else if (host.includes("dev.") || host.includes("ops.") || host.includes("admin.")) {
      routePrefix = "/admin";
    } else if (host.includes("api.")) {
      routePrefix = "/api";
    }
  }

  // If we have a route prefix and the path doesn't already start with it
  if (routePrefix && !pathname.startsWith(routePrefix)) {
    const url = request.nextUrl.clone();
    url.pathname = `${routePrefix}${pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
