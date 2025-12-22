"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import superjson from "superjson";
import { api } from "./client";

interface APIProviderProps {
  children: React.ReactNode;
  source?: string;
}

function getApiUrl() {
  if (typeof window !== "undefined") {
    return "https://api.hyble.co";
  }
  return process.env.NEXT_PUBLIC_API_URL || "https://api.hyble.co";
}

export function APIProvider({ children, source = "hyble-app" }: APIProviderProps) {
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

  const [trpcClient] = useState(() =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (api as any).createClient({
      links: [
        loggerLink({
          enabled: () => process.env.NODE_ENV === "development",
        }),
        httpBatchLink({
          url: `${getApiUrl()}/api/trpc`,
          transformer: superjson,
          headers() {
            return {
              "x-trpc-source": source,
            };
          },
        }),
      ],
    })
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const TRPCProvider = (api as any).Provider;

  return (
    <TRPCProvider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </TRPCProvider>
  );
}
