import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const mergeRouters = t.mergeRouters;

// Public procedure - no auth required
export const publicProcedure = t.procedure;

// Protected procedure - requires authentication
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }

  // Check if user is not banned/suspended
  if (ctx.session.user.status === "SUSPENDED") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Your account has been suspended",
    });
  }

  if (ctx.session.user.status === "FROZEN") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Your account is frozen. Please unfreeze it to continue.",
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      user: ctx.session.user,
    },
  });
});

// Verified procedure - requires email verification (Trust Level 1+)
export const verifiedProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.trustLevel === "GUEST") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Please verify your email to access this feature",
    });
  }

  return next({ ctx });
});

// Secure procedure - requires 2FA enabled (Trust Level 2+)
export const secureProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.trustLevel === "GUEST" || ctx.user.trustLevel === "VERIFIED") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Please enable two-factor authentication to access this feature",
    });
  }

  return next({ ctx });
});

// Admin procedure - requires admin role
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const adminRoles = ["admin", "super_admin"];
  if (!adminRoles.includes(ctx.user.role)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You must be an admin to access this resource",
    });
  }

  return next({ ctx });
});

// Super admin procedure - requires super_admin role
export const superAdminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== "super_admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You must be a super admin to access this resource",
    });
  }

  return next({ ctx });
});

export { t };
