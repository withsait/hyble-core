import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Discord from "next-auth/providers/discord";
import { compare } from "bcryptjs";
import { prisma } from "@hyble/db";
import { authenticator } from "otplib";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        twoFactorCode: { label: "2FA Code", type: "text" },
        isBackupCode: { label: "Is Backup Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: {
            twoFactorAuth: true,
            backupCodes: {
              where: { used: false },
            },
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        const isValid = await compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        // Check if 2FA is enabled
        if (user.twoFactorAuth?.enabled) {
          const twoFactorCode = credentials.twoFactorCode as string | undefined;
          const isBackupCode = credentials.isBackupCode === "true";

          // If no 2FA code provided, reject login (frontend should have redirected to 2FA page)
          if (!twoFactorCode) {
            throw new Error("2FA code required");
          }

          let is2FAValid = false;

          if (isBackupCode) {
            // Verify backup code
            for (const backupCode of user.backupCodes) {
              const matches = await bcrypt.compare(
                twoFactorCode.toUpperCase(),
                backupCode.code
              );
              if (matches) {
                // Mark backup code as used
                await prisma.backupCode.update({
                  where: { id: backupCode.id },
                  data: {
                    used: true,
                    usedAt: new Date(),
                  },
                });
                is2FAValid = true;
                break;
              }
            }
          } else {
            // Verify TOTP code
            is2FAValid = authenticator.verify({
              token: twoFactorCode,
              secret: user.twoFactorAuth.secret,
            });
          }

          if (!is2FAValid) {
            // Log failed attempt
            await prisma.securityLog.create({
              data: {
                userId: user.id,
                action: "LOGIN",
                status: "FAILURE",
                metadata: { reason: "invalid_2fa_code", isBackupCode },
              },
            });
            throw new Error("Invalid 2FA code");
          }

          // Log successful 2FA
          await prisma.securityLog.create({
            data: {
              userId: user.id,
              action: "LOGIN",
              status: "SUCCESS",
              metadata: { method: isBackupCode ? "backup_code" : "totp" },
            },
          });
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
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as any).role as string;
        // Generate unique session token for tracking
        token.sessionToken = uuidv4();
      }

      // Handle session updates
      if (trigger === "update" && session) {
        token.name = session.name;
        token.image = session.image;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        (session as any).sessionToken = token.sessionToken as string;
      }
      return session;
    },
  },
  events: {
    async signIn({ user, isNewUser }) {
      if (isNewUser) {
        // Create default wallet for new users
        await prisma.wallet.create({
          data: {
            userId: user.id!,
            balance: 0,
            currency: "USD",
          },
        });
      }
    },
  },
  trustHost: true,
});
