import { createTRPCReact } from "@trpc/react-query";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

// Dynamic router type - will be inferred from core
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRouter = any;

export const api = createTRPCReact<AnyRouter>();

// Type exports for consumers
export type AppRouter = AnyRouter;
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
