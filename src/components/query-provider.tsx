"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Created inside the component, not at module scope: on the server a
 * module-level client would be shared between concurrent requests, leaking one
 * visitor's cache into another's render.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Server-rendered data reaches the browser already stale — the post
            // page is ISR-cached for 300s, so anything embedded in the HTML can
            // be minutes old. Treating it as stale forces a refetch on mount,
            // which is precisely the bug this was brought in to fix.
            staleTime: 0,
            refetchOnWindowFocus: true,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}
