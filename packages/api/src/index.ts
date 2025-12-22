// Client exports (for frontend apps)
export { api, type AppRouter, type RouterInputs, type RouterOutputs } from "./client";
export { APIProvider } from "./react";

// Re-export for convenience
export { createTRPCReact } from "@trpc/react-query";
export { httpBatchLink, loggerLink } from "@trpc/client";
export { QueryClient, QueryClientProvider } from "@tanstack/react-query";
