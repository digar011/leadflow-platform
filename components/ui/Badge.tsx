"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "success"
    | "warning"
    | "error"
    | "info"
    | "gold"
    | "new"
    | "contacted"
    | "qualified"
    | "proposal"
    | "negotiation"
    | "won"
    | "lost";
  size?: "sm" | "md";
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "sm", children, ...props }, ref) => {
    const variants = {
      default: "bg-white/10 text-text-secondary",
      success: "bg-status-success/20 text-status-success",
      warning: "bg-status-warning/20 text-status-warning",
      error: "bg-status-error/20 text-status-error",
      info: "bg-status-info/20 text-status-info",
      gold: "bg-gold/20 text-gold",
      // Pipeline stages
      new: "bg-pipeline-new/20 text-pipeline-new",
      contacted: "bg-pipeline-contacted/20 text-pipeline-contacted",
      qualified: "bg-pipeline-qualified/20 text-pipeline-qualified",
      proposal: "bg-pipeline-proposal/20 text-pipeline-proposal",
      negotiation: "bg-pipeline-negotiation/20 text-pipeline-negotiation",
      won: "bg-pipeline-won/20 text-pipeline-won",
      lost: "bg-pipeline-lost/20 text-pipeline-lost",
    };

    const sizes = {
      sm: "px-2 py-0.5 text-xs",
      md: "px-2.5 py-1 text-sm",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full font-medium",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export { Badge };

// Helper to get badge variant from status
export function getStatusBadgeVariant(status: string): BadgeProps["variant"] {
  const statusMap: Record<string, BadgeProps["variant"]> = {
    new: "new",
    contacted: "contacted",
    qualified: "qualified",
    proposal: "proposal",
    negotiation: "negotiation",
    won: "won",
    lost: "lost",
    do_not_contact: "error",
  };
  return statusMap[status] || "default";
}

export function getTemperatureBadgeVariant(temp: string): BadgeProps["variant"] {
  const tempMap: Record<string, BadgeProps["variant"]> = {
    cold: "info",
    warm: "warning",
    hot: "error",
  };
  return tempMap[temp] || "default";
}
