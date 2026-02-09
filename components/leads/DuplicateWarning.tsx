"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Badge, getStatusBadgeVariant } from "@/components/ui/Badge";
import type { LeadStatus } from "@/lib/types/database";

interface DuplicateMatch {
  id: string;
  business_name: string;
  email: string | null;
  phone: string | null;
  status: string;
}

interface DuplicateWarningProps {
  duplicates: DuplicateMatch[];
}

export function DuplicateWarning({ duplicates }: DuplicateWarningProps) {
  if (duplicates.length === 0) return null;

  return (
    <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-orange-300">
            Possible duplicate{duplicates.length !== 1 ? "s" : ""} found
          </p>
          <p className="text-sm text-text-muted mt-1">
            You can still create this lead if it is not a duplicate.
          </p>
          <div className="mt-3 space-y-2">
            {duplicates.map((match) => (
              <Link
                key={match.id}
                href={`/leads/${match.id}`}
                className="flex items-center justify-between rounded-md bg-white/5 px-3 py-2 hover:bg-white/10 transition-colors group"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary group-hover:text-gold transition-colors truncate">
                    {match.business_name}
                  </p>
                  {match.email && (
                    <p className="text-xs text-text-muted truncate">{match.email}</p>
                  )}
                </div>
                <Badge
                  variant={getStatusBadgeVariant(match.status as LeadStatus)}
                  size="sm"
                >
                  {match.status.replace(/_/g, " ")}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
