import NextAuth, { type NextAuthResult } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@hyble/db";

const nextAuth: NextAuthResult = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/admin/login",
    signOut: "/logout",
    error: "/admin/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        // Import bcryptjs dynamically to avoid edge runtime issues
        const { compare } = await import("bcryptjs");
        const isValid = await compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        // Check if user is admin
        if (user.role !== "admin") {
          throw new Error("Access denied. Admin privileges required.");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as any).role as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
    async signIn({ user }) {
      // Only allow admin users
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
      });
      return dbUser?.role === "admin";
    },
  },
  trustHost: true,
});

export const handlers = nextAuth.handlers;
export const signIn: typeof nextAuth.signIn = nextAuth.signIn;
export const signOut: typeof nextAuth.signOut = nextAuth.signOut;
export const auth = nextAuth.auth;

export async function getAdminSession() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") {
    return null;
  }
  return session;
}
