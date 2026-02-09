import type { SubscriptionTier } from "@/lib/types/database";

export type FeatureKey =
  | "leads"
  | "users"
  | "campaigns"
  | "automationRules"
  | "pipelineView"
  | "savedReports"
  | "csvExport"
  | "reportScheduling"
  | "customReports"
  | "biIntegration"
  | "apiAccess"
  | "webhooks"
  | "scopedApiKeys"
  | "dedicatedApi"
  | "slaSupport"
  | "adminPanel"
  | "auditLogs"
  | "auditExport"
  | "teamRoles";

export type LimitValue = number | boolean;

export interface PlanDefinition {
  tier: SubscriptionTier;
  name: string;
  tagline: string;
  monthlyPrice: number | null;
  annualPrice: number | null;
  limits: Record<FeatureKey, LimitValue>;
  highlighted?: boolean;
  ctaLabel: string;
  ctaVariant: "primary" | "outline";
}

export const PLAN_DEFINITIONS: Record<SubscriptionTier, PlanDefinition> = {
  free: {
    tier: "free",
    name: "Free",
    tagline: "Get started with the basics",
    monthlyPrice: 0,
    annualPrice: 0,
    limits: {
      leads: 25,
      users: 1,
      campaigns: 0,
      automationRules: 0,
      pipelineView: false,
      savedReports: 0,
      csvExport: false,
      reportScheduling: false,
      customReports: false,
      biIntegration: false,
      apiAccess: false,
      webhooks: false,
      scopedApiKeys: false,
      dedicatedApi: false,
      slaSupport: false,
      adminPanel: false,
      auditLogs: false,
      auditExport: false,
      teamRoles: false,
    },
    ctaLabel: "Get Started Free",
    ctaVariant: "outline",
  },
  starter: {
    tier: "starter",
    name: "Starter",
    tagline: "For small teams getting started",
    monthlyPrice: 49,
    annualPrice: 39,
    limits: {
      leads: 500,
      users: 3,
      campaigns: 5,
      automationRules: 3,
      pipelineView: true,
      savedReports: 5,
      csvExport: false,
      reportScheduling: false,
      customReports: false,
      biIntegration: false,
      apiAccess: false,
      webhooks: false,
      scopedApiKeys: false,
      dedicatedApi: false,
      slaSupport: false,
      adminPanel: false,
      auditLogs: false,
      auditExport: false,
      teamRoles: true,
    },
    ctaLabel: "Start Free Trial",
    ctaVariant: "outline",
  },
  growth: {
    tier: "growth",
    name: "Growth",
    tagline: "For growing businesses",
    monthlyPrice: 129,
    annualPrice: 109,
    limits: {
      leads: 5000,
      users: 10,
      campaigns: 25,
      automationRules: 20,
      pipelineView: true,
      savedReports: Infinity,
      csvExport: true,
      reportScheduling: false,
      customReports: false,
      biIntegration: false,
      apiAccess: true,
      webhooks: true,
      scopedApiKeys: false,
      dedicatedApi: false,
      slaSupport: false,
      adminPanel: false,
      auditLogs: false,
      auditExport: false,
      teamRoles: true,
    },
    highlighted: true,
    ctaLabel: "Start Free Trial",
    ctaVariant: "primary",
  },
  business: {
    tier: "business",
    name: "Business",
    tagline: "For scaling organizations",
    monthlyPrice: 299,
    annualPrice: 249,
    limits: {
      leads: 25000,
      users: 25,
      campaigns: Infinity,
      automationRules: Infinity,
      pipelineView: true,
      savedReports: Infinity,
      csvExport: true,
      reportScheduling: true,
      customReports: false,
      biIntegration: false,
      apiAccess: true,
      webhooks: true,
      scopedApiKeys: true,
      dedicatedApi: false,
      slaSupport: false,
      adminPanel: true,
      auditLogs: true,
      auditExport: false,
      teamRoles: true,
    },
    ctaLabel: "Start Free Trial",
    ctaVariant: "outline",
  },
  enterprise: {
    tier: "enterprise",
    name: "Enterprise",
    tagline: "Custom solutions for large teams",
    monthlyPrice: null,
    annualPrice: null,
    limits: {
      leads: Infinity,
      users: Infinity,
      campaigns: Infinity,
      automationRules: Infinity,
      pipelineView: true,
      savedReports: Infinity,
      csvExport: true,
      reportScheduling: true,
      customReports: true,
      biIntegration: true,
      apiAccess: true,
      webhooks: true,
      scopedApiKeys: true,
      dedicatedApi: true,
      slaSupport: true,
      adminPanel: true,
      auditLogs: true,
      auditExport: true,
      teamRoles: true,
    },
    ctaLabel: "Contact Sales",
    ctaVariant: "outline",
  },
};

export const TIER_ORDER: SubscriptionTier[] = [
  "free",
  "starter",
  "growth",
  "business",
  "enterprise",
];

export function getPlanDefinition(tier: SubscriptionTier): PlanDefinition {
  return PLAN_DEFINITIONS[tier];
}

export function getTierIndex(tier: SubscriptionTier): number {
  return TIER_ORDER.indexOf(tier);
}

export function getLimit(tier: SubscriptionTier, feature: FeatureKey): LimitValue {
  return PLAN_DEFINITIONS[tier].limits[feature];
}

export function hasFeature(tier: SubscriptionTier, feature: FeatureKey): boolean {
  const limit = getLimit(tier, feature);
  if (typeof limit === "boolean") return limit;
  return limit > 0;
}

export function getNumericLimit(tier: SubscriptionTier, feature: FeatureKey): number {
  const limit = getLimit(tier, feature);
  if (typeof limit === "number") return limit;
  return limit ? Infinity : 0;
}

export function minimumTierForFeature(feature: FeatureKey): SubscriptionTier {
  for (const tier of TIER_ORDER) {
    if (hasFeature(tier, feature)) return tier;
  }
  return "enterprise";
}

export function isNearLimit(
  usage: number,
  tier: SubscriptionTier,
  feature: FeatureKey,
  threshold: number = 0.8
): boolean {
  const limit = getNumericLimit(tier, feature);
  if (limit === 0 || limit === Infinity) return false;
  return usage / limit >= threshold;
}

export function isAtLimit(
  usage: number,
  tier: SubscriptionTier,
  feature: FeatureKey
): boolean {
  const limit = getNumericLimit(tier, feature);
  if (limit === Infinity) return false;
  return usage >= limit;
}

export function formatPrice(price: number | null): string {
  if (price === null) return "Custom";
  if (price === 0) return "Free";
  return `$${price}`;
}

export function formatLimit(value: LimitValue): string {
  if (typeof value === "boolean") return value ? "Included" : "—";
  if (value === Infinity) return "Unlimited";
  return value.toLocaleString();
}

export interface PlanFeatureRow {
  label: string;
  feature: FeatureKey;
  category: "core" | "reports" | "integrations" | "admin";
}

export const PLAN_FEATURE_ROWS: PlanFeatureRow[] = [
  { label: "Leads", feature: "leads", category: "core" },
  { label: "Team Members", feature: "users", category: "core" },
  { label: "Campaigns", feature: "campaigns", category: "core" },
  { label: "Automation Rules", feature: "automationRules", category: "core" },
  { label: "Pipeline View", feature: "pipelineView", category: "core" },
  { label: "Saved Reports", feature: "savedReports", category: "reports" },
  { label: "CSV Export", feature: "csvExport", category: "reports" },
  { label: "Report Scheduling", feature: "reportScheduling", category: "reports" },
  { label: "API Access", feature: "apiAccess", category: "integrations" },
  { label: "Webhooks", feature: "webhooks", category: "integrations" },
  { label: "Scoped API Keys", feature: "scopedApiKeys", category: "integrations" },
  { label: "Admin Panel", feature: "adminPanel", category: "admin" },
  { label: "Audit Logs", feature: "auditLogs", category: "admin" },
  { label: "Team Roles (RBAC)", feature: "teamRoles", category: "admin" },
];
