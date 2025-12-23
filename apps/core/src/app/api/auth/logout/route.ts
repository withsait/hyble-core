import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();

  // Get the cookie domain based on environment
  const cookieDomain = process.env.NODE_ENV === "production" ? ".hyble.co" : undefined;

  // Delete all possible session cookie variations
  // Note: CSRF token uses __Host- prefix in production (see auth.ts)
  const cookieNames = [
    "authjs.session-token",
    "__Secure-authjs.session-token",
    "authjs.callback-url",
    "__Secure-authjs.callback-url",
    "authjs.csrf-token",
    "__Host-authjs.csrf-token",
  ];

  const response = NextResponse.json({ success: true });

  // Delete cookies in the response
  for (const name of cookieNames) {
    // Delete without domain
    response.cookies.delete(name);

    // __Host- cookies cannot have a domain set
    const isHostCookie = name.startsWith("__Host-");

    // Also try to delete with explicit settings
    response.cookies.set(name, "", {
      expires: new Date(0),
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    // Delete with domain for cross-subdomain cookies (not for __Host- cookies)
    if (cookieDomain && !isHostCookie) {
      response.cookies.set(name, "", {
        expires: new Date(0),
        path: "/",
        domain: cookieDomain,
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      });
    }
  }

  return response;
}

export async function GET(request: Request) {
  // Also support GET for simple redirects
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;
  const response = NextResponse.redirect(new URL("/login?logout=success", baseUrl));

  const cookieDomain = process.env.NODE_ENV === "production" ? ".hyble.co" : undefined;

  // Note: CSRF token uses __Host- prefix in production (see auth.ts)
  const cookieNames = [
    "authjs.session-token",
    "__Secure-authjs.session-token",
    "authjs.callback-url",
    "__Secure-authjs.callback-url",
    "authjs.csrf-token",
    "__Host-authjs.csrf-token",
  ];

  for (const name of cookieNames) {
    response.cookies.delete(name);

    // __Host- cookies cannot have a domain set
    const isHostCookie = name.startsWith("__Host-");

    response.cookies.set(name, "", {
      expires: new Date(0),
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    // Only set domain for non-__Host- cookies
    if (cookieDomain && !isHostCookie) {
      response.cookies.set(name, "", {
        expires: new Date(0),
        path: "/",
        domain: cookieDomain,
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      });
    }
  }

  return response;
}
