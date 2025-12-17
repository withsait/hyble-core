import { createTRPCReact } from "@trpc/react-query";

// Remote tRPC client - types are inferred dynamically
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRouter = any;
export const trpc = createTRPCReact<AnyRouter>();

// Type-safe helper for query hooks (opt-in type safety)
export type TRPCClient = typeof trpc;
