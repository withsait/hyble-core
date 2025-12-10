import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Domain to route group mapping
const DOMAIN_ROUTES: Record<string, string> = {
  // Marketing site
  "hyble.co": "/marketing",
  "www.hyble.co": "/marketing",
  "localhost:3001": "/marketing", // Local development

  // User Panel
  "panel.hyble.co": "/panel",
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

  // Default to marketing
  if (!routePrefix) {
    if (host.includes("panel.")) {
      routePrefix = "/panel";
    } else {
      routePrefix = "/marketing";
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
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
