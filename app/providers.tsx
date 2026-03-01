"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { ViewModeProvider } from "@/lib/contexts/ViewModeContext";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              // Don't retry aborted requests (caused by React Strict Mode double-mount)
              if (error instanceof DOMException && error.name === "AbortError") return false;
              return failureCount < 3;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ViewModeProvider>{children}</ViewModeProvider>
    </QueryClientProvider>
  );
}
