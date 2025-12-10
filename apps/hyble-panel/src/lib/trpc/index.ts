// Client-side exports
export { trpc } from "./client";
export { TRPCProvider } from "./provider";

// Custom hooks
export * from "./hooks";

// Server-side exports (import from ./server directly to avoid "server-only" issues)
// export { api, getServerApi } from "./server";

// Type exports
export type { AppRouter } from "@/server/routers";
