"use client";

import { useState } from "react";
import { Check, X, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  PLAN_DEFINITIONS,
  TIER_ORDER,
  PLAN_FEATURE_ROWS,
  formatPrice,
  formatLimit,
} from "@/lib/utils/subscription";
import type { SubscriptionTier, BillingCycle } from "@/lib/types/database";

const TIER_COLORS: Record<SubscriptionTier, string> = {
  free: "text-text-muted",
  starter: "text-blue-400",
  growth: "text-gold",
  business: "text-purple-400",
  enterprise: "text-emerald-400",
};

const PLAN_FEATURES: Record<SubscriptionTier, string[]> = {
  free: [
    "50 leads",
    "1 user",
    "1 campaign",
    "Basic dashboard",
    "Lead pipeline (Kanban + List)",
    "Contact management",
    "Community support",
  ],
  starter: [
    "500 leads",
    "3 users",
    "5 campaigns",
    "3 automation rules",
    "5 saved reports",
    "Basic team roles",
    "Email support (48hr)",
  ],
  growth: [
    "5,000 leads",
    "10 users",
    "25 campaigns",
    "20 automation rules",
    "Unlimited reports + CSV export",
    "API access + Webhooks",
    "Full RBAC",
    "Priority support (24hr)",
  ],
  business: [
    "25,000 leads",
    "25 users",
    "Unlimited campaigns",
    "Unlimited automation",
    "Report scheduling",
    "Scoped API keys",
    "Admin panel + Audit logs",
    "Priority support (4hr)",
  ],
  enterprise: [
    "Unlimited everything",
    "Unlimited users",
    "Custom integrations",
    "Dedicated API + SLA",
    "BI tool integrations",
    "White-label options",
    "Dedicated CSM",
    "Custom roles",
  ],
};

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

  return (
    <div className="space-y-16">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-text-primary">
          Simple, transparent pricing
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto">
          Choose the plan that fits your business. Start free and scale as you
          grow.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-3 pt-4">
          <span
            className={cn(
              "text-sm font-medium",
              billingCycle === "monthly"
                ? "text-text-primary"
                : "text-text-muted"
            )}
          >
            Monthly
          </span>
          <button
            onClick={() =>
              setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly")
            }
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors",
              billingCycle === "annual" ? "bg-gold" : "bg-white/20"
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
                billingCycle === "annual" ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
          <span
            className={cn(
              "text-sm font-medium",
              billingCycle === "annual"
                ? "text-text-primary"
                : "text-text-muted"
            )}
          >
            Annual
          </span>
          {billingCycle === "annual" && (
            <Badge variant="gold" className="text-xs">
              Save up to 20%
            </Badge>
          )}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {TIER_ORDER.map((tierKey) => {
          const plan = PLAN_DEFINITIONS[tierKey];
          const price =
            billingCycle === "annual" ? plan.annualPrice : plan.monthlyPrice;
          const features = PLAN_FEATURES[tierKey];
          const isHighlighted = plan.highlighted;

          return (
            <Card
              key={tierKey}
              variant="glass"
              className={cn(
                "relative flex flex-col",
                isHighlighted && "border-gold/50 ring-1 ring-gold/30"
              )}
            >
              {isHighlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="gold" className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className="p-6 flex-1 flex flex-col">
                {/* Plan Name */}
                <h3
                  className={cn(
                    "text-lg font-semibold",
                    TIER_COLORS[tierKey]
                  )}
                >
                  {plan.name}
                </h3>
                <p className="text-sm text-text-muted mt-1">{plan.tagline}</p>

                {/* Price */}
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-bold text-text-primary">
                    {formatPrice(price)}
                  </span>
                  {price !== null && price > 0 && (
                    <span className="text-text-muted text-sm">/mo</span>
                  )}
                  {billingCycle === "annual" &&
                    price !== null &&
                    price > 0 && (
                      <p className="text-xs text-text-muted mt-1">
                        billed annually
                      </p>
                    )}
                </div>

                {/* Features */}
                <ul className="space-y-2.5 flex-1 mb-6">
                  {features.map((feat) => (
                    <li
                      key={feat}
                      className="flex items-start gap-2 text-sm text-text-secondary"
                    >
                      <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  variant={plan.ctaVariant === "primary" ? "primary" : "outline"}
                  className="w-full"
                >
                  {plan.ctaLabel}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Comparison Table */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-text-primary text-center">
          Compare all features
        </h2>

        <Card variant="glass" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-muted w-48">
                    Feature
                  </th>
                  {TIER_ORDER.map((tierKey) => (
                    <th
                      key={tierKey}
                      className={cn(
                        "text-center py-3 px-4 text-sm font-medium",
                        TIER_COLORS[tierKey]
                      )}
                    >
                      {PLAN_DEFINITIONS[tierKey].name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PLAN_FEATURE_ROWS.map((row, idx) => (
                  <tr
                    key={row.feature}
                    className={cn(
                      "border-b border-white/5",
                      idx % 2 === 0 && "bg-white/[0.02]"
                    )}
                  >
                    <td className="py-3 px-4 text-sm text-text-secondary">
                      {row.label}
                    </td>
                    {TIER_ORDER.map((tierKey) => {
                      const val = PLAN_DEFINITIONS[tierKey].limits[row.feature];
                      const display = formatLimit(val);
                      const isEnabled =
                        typeof val === "boolean" ? val : val > 0;

                      return (
                        <td
                          key={tierKey}
                          className="text-center py-3 px-4 text-sm"
                        >
                          {typeof val === "boolean" ? (
                            val ? (
                              <Check className="h-4 w-4 text-gold mx-auto" />
                            ) : (
                              <X className="h-4 w-4 text-text-muted/40 mx-auto" />
                            )
                          ) : (
                            <span
                              className={
                                isEnabled
                                  ? "text-text-primary"
                                  : "text-text-muted/40"
                              }
                            >
                              {display}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
