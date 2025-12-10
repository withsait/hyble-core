import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { createCallerFactory } from "@/server/trpc/trpc";
import { appRouter } from "@/server/routers";
import { createContext } from "@/server/trpc/context";

/**
 * Server-side tRPC caller
 * Use this for server components and server actions
 */
const createCaller = createCallerFactory(appRouter);

/**
 * Cached server-side tRPC caller
 * Creates context once per request
 */
export const api = cache(async () => {
  const headersList = await headers();
  const ctx = await createContext({
    headers: headersList,
  });
  return createCaller(ctx);
});

/**
 * Direct server caller without caching
 * Useful when you need fresh data
 */
export const getServerApi = async () => {
  const headersList = await headers();
  const ctx = await createContext({
    headers: headersList,
  });
  return createCaller(ctx);
};
