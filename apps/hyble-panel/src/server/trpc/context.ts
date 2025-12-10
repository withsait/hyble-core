import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { auth } from "@/lib/auth";
import { prisma } from "@hyble/db";

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  trustLevel: string;
  status: string;
}

export interface Session {
  user: User;
  expires: string;
}

export interface CreateContextOptions {
  session: Session | null;
  headers: Headers;
  ip: string | null;
  userAgent: string | null;
}

// For server-side caller (RSC)
interface ServerContextOptions {
  headers: Headers;
}

export async function createContext(
  opts?: FetchCreateContextFnOptions | ServerContextOptions
): Promise<CreateContextOptions> {
  // NextAuth v5 uses `auth()` instead of `getServerSession()`
  const authSession = await auth();

  // Map to our expected session shape
  const session: Session | null = authSession?.user
    ? {
        user: {
          id: (authSession.user as any).id || "",
          email: authSession.user.email || "",
          name: authSession.user.name || null,
          role: (authSession.user as any).role || "user",
          trustLevel: (authSession.user as any).trustLevel || "GUEST",
          status: (authSession.user as any).status || "ACTIVE",
        },
        expires: authSession.expires || "",
      }
    : null;

  // Extract headers - handle both FetchCreateContextFnOptions and ServerContextOptions
  let headers: Headers;
  if (opts && "req" in opts && opts.req) {
    headers = opts.req.headers;
  } else if (opts && "headers" in opts) {
    headers = opts.headers;
  } else {
    headers = new Headers();
  }

  const ip =
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    null;
  const userAgent = headers.get("user-agent");

  return {
    session,
    headers,
    ip,
    userAgent,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

// Prisma client export for routers
export { prisma };
