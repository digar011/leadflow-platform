"use client";

import Link from "next/link";
import { Crown, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { UsageLimitBar } from "@/components/subscription/UsageLimitBar";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { useLeadStats } from "@/lib/hooks/useLeads";
import { formatPrice } from "@/lib/utils/subscription";

export default function BillingPage() {
  const { tier, billingCycle, plan, isLoading } = useSubscription();
  const { data: leadStats } = useLeadStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-40 bg-white/5 rounded-xl animate-pulse" />
        <div className="h-32 bg-white/5 rounded-xl animate-pulse" />
      </div>
    );
  }

  const tierColors: Record<string, string> = {
    free: "bg-white/10 text-text-muted",
    starter: "bg-blue-500/20 text-blue-400",
    growth: "bg-gold/20 text-gold",
    business: "bg-purple-500/20 text-purple-400",
    enterprise: "bg-emerald-500/20 text-emerald-400",
  };

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gold/20">
                <Crown className="h-6 w-6 text-gold" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-text-primary">
                    {plan.name}
                  </h3>
                  <Badge className={tierColors[tier]}>{tier}</Badge>
                </div>
                <p className="text-text-secondary">
                  {plan.monthlyPrice === null
                    ? "Custom pricing"
                    : plan.monthlyPrice === 0
                    ? "Free forever"
                    : `${formatPrice(
                        billingCycle === "annual"
                          ? plan.annualPrice
                          : plan.monthlyPrice
                      )}/month${
                        billingCycle === "annual" ? " (billed annually)" : ""
                      }`}
                </p>
              </div>
            </div>
            <Link href="/pricing">
              <Button variant="outline">
                <ExternalLink className="h-4 w-4 mr-1.5" />
                {tier === "enterprise" ? "View Plans" : "Change Plan"}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Usage Summary */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <UsageLimitBar
            feature="leads"
            featureLabel="Leads"
            currentUsage={leadStats?.total ?? 0}
            showAlways
          />
          <UsageLimitBar
            feature="campaigns"
            featureLabel="Campaigns"
            currentUsage={0}
            showAlways
          />
          <UsageLimitBar
            feature="automationRules"
            featureLabel="Automation Rules"
            currentUsage={0}
            showAlways
          />
          <UsageLimitBar
            feature="savedReports"
            featureLabel="Saved Reports"
            currentUsage={0}
            showAlways
          />
        </CardContent>
      </Card>

      {/* Plan Details */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Plan Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-secondary">{plan.tagline}</p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-white/5 p-3">
              <p className="text-xs text-text-muted">Billing Cycle</p>
              <p className="text-sm font-medium text-text-primary capitalize">
                {billingCycle}
              </p>
            </div>
            <div className="rounded-lg bg-white/5 p-3">
              <p className="text-xs text-text-muted">Plan Tier</p>
              <p className="text-sm font-medium text-text-primary capitalize">
                {tier}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
