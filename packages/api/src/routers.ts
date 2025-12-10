// Placeholder - actual routers will be defined in hyble-core
// This file exports the AppRouter type for client usage

import { createTRPCRouter } from "./server";

// Base router - will be extended in hyble-core
export const appRouter = createTRPCRouter({});

export type AppRouter = typeof appRouter;
