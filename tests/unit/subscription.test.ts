import {
  getPlanDefinition,
  getTierIndex,
  getLimit,
  hasFeature,
  getNumericLimit,
  minimumTierForFeature,
  isNearLimit,
  isAtLimit,
  formatPrice,
  formatLimit,
  TIER_ORDER,
  PLAN_DEFINITIONS,
} from "@/lib/utils/subscription";

describe("TIER_ORDER", () => {
  it("has 5 tiers in ascending order", () => {
    expect(TIER_ORDER).toEqual(["free", "starter", "growth", "business", "enterprise"]);
  });
});

describe("getPlanDefinition", () => {
  it("returns the free plan", () => {
    const plan = getPlanDefinition("free");
    expect(plan.name).toBe("Free");
    expect(plan.monthlyPrice).toBe(0);
  });

  it("returns the enterprise plan", () => {
    const plan = getPlanDefinition("enterprise");
    expect(plan.name).toBe("Enterprise");
    expect(plan.monthlyPrice).toBeNull();
  });
});

describe("getTierIndex", () => {
  it("returns 0 for free", () => {
    expect(getTierIndex("free")).toBe(0);
  });

  it("returns 4 for enterprise", () => {
    expect(getTierIndex("enterprise")).toBe(4);
  });
});

describe("getLimit", () => {
  it("returns numeric limit for leads on free", () => {
    expect(getLimit("free", "leads")).toBe(25);
  });

  it("returns boolean limit for csvExport on free", () => {
    expect(getLimit("free", "csvExport")).toBe(false);
  });

  it("returns Infinity for leads on enterprise", () => {
    expect(getLimit("enterprise", "leads")).toBe(Infinity);
  });
});

describe("hasFeature", () => {
  it("returns false for csvExport on free", () => {
    expect(hasFeature("free", "csvExport")).toBe(false);
  });

  it("returns true for csvExport on growth", () => {
    expect(hasFeature("growth", "csvExport")).toBe(true);
  });

  it("returns true for numeric limits > 0", () => {
    expect(hasFeature("free", "leads")).toBe(true);
  });

  it("returns false for numeric limit 0 (campaigns on free)", () => {
    expect(hasFeature("free", "campaigns")).toBe(false);
  });
});

describe("getNumericLimit", () => {
  it("returns the number for numeric limits", () => {
    expect(getNumericLimit("starter", "leads")).toBe(500);
  });

  it("returns Infinity for boolean true", () => {
    expect(getNumericLimit("growth", "csvExport")).toBe(Infinity);
  });

  it("returns 0 for boolean false", () => {
    expect(getNumericLimit("free", "csvExport")).toBe(0);
  });
});

describe("minimumTierForFeature", () => {
  it("returns free for leads (available on all tiers)", () => {
    expect(minimumTierForFeature("leads")).toBe("free");
  });

  it("returns growth for csvExport", () => {
    expect(minimumTierForFeature("csvExport")).toBe("growth");
  });

  it("returns enterprise for dedicatedApi", () => {
    expect(minimumTierForFeature("dedicatedApi")).toBe("enterprise");
  });

  it("returns starter for pipelineView", () => {
    expect(minimumTierForFeature("pipelineView")).toBe("starter");
  });
});

describe("isNearLimit", () => {
  it("returns true when usage is at 80% of limit", () => {
    // free tier has 25 leads limit
    expect(isNearLimit(20, "free", "leads")).toBe(true);
  });

  it("returns false when usage is below threshold", () => {
    expect(isNearLimit(10, "free", "leads")).toBe(false);
  });

  it("returns false for Infinity limits", () => {
    expect(isNearLimit(999999, "enterprise", "leads")).toBe(false);
  });

  it("returns false for 0 limits", () => {
    expect(isNearLimit(0, "free", "campaigns")).toBe(false);
  });

  it("supports custom threshold", () => {
    // 10/25 = 40%, with threshold 0.3 should be near
    expect(isNearLimit(10, "free", "leads", 0.3)).toBe(true);
  });
});

describe("isAtLimit", () => {
  it("returns true when at limit", () => {
    expect(isAtLimit(25, "free", "leads")).toBe(true);
  });

  it("returns true when over limit", () => {
    expect(isAtLimit(30, "free", "leads")).toBe(true);
  });

  it("returns false when under limit", () => {
    expect(isAtLimit(24, "free", "leads")).toBe(false);
  });

  it("returns false for Infinity limit", () => {
    expect(isAtLimit(999999, "enterprise", "leads")).toBe(false);
  });
});

describe("formatPrice", () => {
  it("returns 'Custom' for null", () => {
    expect(formatPrice(null)).toBe("Custom");
  });

  it("returns 'Free' for 0", () => {
    expect(formatPrice(0)).toBe("Free");
  });

  it("formats a price with dollar sign", () => {
    expect(formatPrice(49)).toBe("$49");
  });
});

describe("formatLimit", () => {
  it("returns 'Included' for true", () => {
    expect(formatLimit(true)).toBe("Included");
  });

  it("returns dash for false", () => {
    expect(formatLimit(false)).toBe("—");
  });

  it("returns 'Unlimited' for Infinity", () => {
    expect(formatLimit(Infinity)).toBe("Unlimited");
  });

  it("formats numbers with locale", () => {
    expect(formatLimit(5000)).toBe("5,000");
  });
});
