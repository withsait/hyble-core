import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server/routers";

/**
 * tRPC React Query client
 * Use this for client-side data fetching with React Query
 */
export const trpc = createTRPCReact<AppRouter>();
