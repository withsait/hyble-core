// Server exports
export {
  createTRPCRouter,
  createCallerFactory,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
  t,
  type Context,
} from "./server";

// This will be set by hyble-core
export type { AppRouter } from "./routers";
