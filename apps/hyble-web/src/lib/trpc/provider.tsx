"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import superjson from "superjson";
import { trpc } from "./client";

function getApiUrl() {
  if (typeof window !== "undefined") {
    return "https://api.hyble.co";
  }
  return process.env.NEXT_PUBLIC_API_URL || "https://api.hyble.co";
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [trpcClient] = useState(() =>
    (trpc as any).createClient({
      links: [
        loggerLink({
          enabled: () => process.env.NODE_ENV === "development",
        }),
        httpBatchLink({
          url: `${getApiUrl()}/api/trpc`,
          transformer: superjson,
          headers() {
            return {
              "x-trpc-source": "hyble-web",
            };
          },
        }),
      ],
    })
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const TRPCProvider = (trpc as any).Provider;

  return (
    <TRPCProvider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </TRPCProvider>
  );
}
