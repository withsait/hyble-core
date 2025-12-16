import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

// TODO: Import from @hyble/api package when available
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AppRouter = any;
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
