"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function DashboardError({
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
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="rounded-full bg-red-500/10 p-4 mb-4">
        <AlertTriangle className="h-10 w-10 text-red-400" />
      </div>
      <h2 className="text-xl font-semibold text-text-primary mb-2">
        Something went wrong
      </h2>
      <p className="text-sm text-text-muted max-w-md mb-6">
        An error occurred while loading this page. This has been logged for
        investigation.
      </p>
      {error.digest && (
        <p className="text-xs text-text-muted mb-4 font-mono">
          Error ID: {error.digest}
        </p>
      )}
      <div className="flex gap-3">
        <Button variant="secondary" onClick={reset}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
        <Button
          variant="ghost"
          onClick={() => (window.location.href = "/dashboard")}
        >
          <Home className="h-4 w-4 mr-2" />
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
