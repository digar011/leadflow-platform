"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center px-4">
      <div className="rounded-full bg-red-500/10 p-4 mb-4">
        <AlertTriangle className="h-10 w-10 text-red-400" />
      </div>
      <h2 className="text-xl font-semibold text-text-primary mb-2">
        Something went wrong
      </h2>
      <p className="text-sm text-text-muted max-w-md mb-6">
        An unexpected error occurred. Please try refreshing the page.
      </p>
      {error.digest && (
        <p className="text-xs text-text-muted mb-4 font-mono">
          Error ID: {error.digest}
        </p>
      )}
      <button
        onClick={reset}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-text-primary transition-colors"
      >
        <RefreshCw className="h-4 w-4" />
        Try Again
      </button>
    </div>
  );
}
