import {
  LEAD_STATUSES,
  LEAD_TEMPERATURES,
  ACTIVITY_TYPES,
  CAMPAIGN_TYPES,
  CAMPAIGN_STATUSES,
  INDUSTRY_CATEGORIES,
  INDUSTRIES,
  LEAD_SOURCES,
  AUTOMATION_TRIGGERS,
  AUTOMATION_ACTIONS,
  REPORT_TYPES,
  DATE_RANGE_PRESETS,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  APP_NAME,
  APP_DESCRIPTION,
  APP_VERSION,
  RATE_LIMITS,
} from "@/lib/utils/constants";

describe("constants", () => {
  describe("LEAD_STATUSES", () => {
    it("has 8 statuses", () => {
      expect(LEAD_STATUSES).toHaveLength(8);
    });

    it("each status has value, label, and color", () => {
      for (const status of LEAD_STATUSES) {
        expect(status.value).toBeDefined();
        expect(status.label).toBeDefined();
        expect(status.color).toBeDefined();
      }
    });

    it("includes key pipeline statuses", () => {
      const values = LEAD_STATUSES.map((s) => s.value);
      expect(values).toContain("new");
      expect(values).toContain("won");
      expect(values).toContain("lost");
      expect(values).toContain("qualified");
    });
  });

  describe("LEAD_TEMPERATURES", () => {
    it("has 3 temperatures", () => {
      expect(LEAD_TEMPERATURES).toHaveLength(3);
    });

    it("includes cold, warm, hot", () => {
      const values = LEAD_TEMPERATURES.map((t) => t.value);
      expect(values).toEqual(["cold", "warm", "hot"]);
    });
  });

  describe("ACTIVITY_TYPES", () => {
    it("has at least 10 types", () => {
      expect(ACTIVITY_TYPES.length).toBeGreaterThanOrEqual(10);
    });

    it("each type has value, label, and icon", () => {
      for (const type of ACTIVITY_TYPES) {
        expect(type.value).toBeDefined();
        expect(type.label).toBeDefined();
        expect(type.icon).toBeDefined();
      }
    });
  });

  describe("CAMPAIGN_TYPES", () => {
    it("has 5 campaign types", () => {
      expect(CAMPAIGN_TYPES).toHaveLength(5);
    });

    it("includes email and multi_channel", () => {
      const values = CAMPAIGN_TYPES.map((c) => c.value);
      expect(values).toContain("email");
      expect(values).toContain("multi_channel");
    });
  });

  describe("CAMPAIGN_STATUSES", () => {
    it("has 4 statuses", () => {
      expect(CAMPAIGN_STATUSES).toHaveLength(4);
    });

    it("includes draft and active", () => {
      const values = CAMPAIGN_STATUSES.map((s) => s.value);
      expect(values).toContain("draft");
      expect(values).toContain("active");
    });
  });

  describe("INDUSTRY_CATEGORIES / INDUSTRIES", () => {
    it("INDUSTRY_CATEGORIES has 16 entries", () => {
      expect(INDUSTRY_CATEGORIES).toHaveLength(16);
    });

    it("INDUSTRIES matches INDUSTRY_CATEGORIES count", () => {
      expect(INDUSTRIES).toHaveLength(INDUSTRY_CATEGORIES.length);
    });

    it("INDUSTRIES includes Other", () => {
      const values = INDUSTRIES.map((i) => i.value);
      expect(values).toContain("other");
    });
  });

  describe("LEAD_SOURCES", () => {
    it("has 12 sources", () => {
      expect(LEAD_SOURCES).toHaveLength(12);
    });

    it("includes google_maps and referral", () => {
      const values = LEAD_SOURCES.map((s) => s.value);
      expect(values).toContain("google_maps");
      expect(values).toContain("referral");
    });
  });

  describe("AUTOMATION_TRIGGERS / AUTOMATION_ACTIONS", () => {
    it("has 7 triggers", () => {
      expect(AUTOMATION_TRIGGERS).toHaveLength(7);
    });

    it("has 8 actions", () => {
      expect(AUTOMATION_ACTIONS).toHaveLength(8);
    });

    it("triggers include lead_created", () => {
      expect(AUTOMATION_TRIGGERS.map((t) => t.value)).toContain("lead_created");
    });

    it("actions include send_email", () => {
      expect(AUTOMATION_ACTIONS.map((a) => a.value)).toContain("send_email");
    });
  });

  describe("REPORT_TYPES", () => {
    it("has 6 report types", () => {
      expect(REPORT_TYPES).toHaveLength(6);
    });
  });

  describe("DATE_RANGE_PRESETS", () => {
    it("has 10 presets", () => {
      expect(DATE_RANGE_PRESETS).toHaveLength(10);
    });

    it("includes custom option", () => {
      expect(DATE_RANGE_PRESETS.map((d) => d.value)).toContain("custom");
    });
  });

  describe("pagination", () => {
    it("DEFAULT_PAGE_SIZE is 25", () => {
      expect(DEFAULT_PAGE_SIZE).toBe(25);
    });

    it("PAGE_SIZE_OPTIONS includes common sizes", () => {
      expect([...PAGE_SIZE_OPTIONS]).toEqual([10, 25, 50, 100]);
    });
  });

  describe("app info", () => {
    it("APP_NAME is Goldyon", () => {
      expect(APP_NAME).toBe("Goldyon");
    });

    it("APP_DESCRIPTION is defined", () => {
      expect(APP_DESCRIPTION).toBeDefined();
      expect(APP_DESCRIPTION.length).toBeGreaterThan(0);
    });

    it("APP_VERSION follows semver", () => {
      expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });

  describe("RATE_LIMITS", () => {
    it("has api, auth, webhook, export configs", () => {
      expect(RATE_LIMITS.api).toBeDefined();
      expect(RATE_LIMITS.auth).toBeDefined();
      expect(RATE_LIMITS.webhook).toBeDefined();
      expect(RATE_LIMITS.export).toBeDefined();
    });

    it("auth has stricter limits than api", () => {
      expect(RATE_LIMITS.auth.requests).toBeLessThan(RATE_LIMITS.api.requests);
    });

    it("all configs have requests and windowMs", () => {
      for (const config of Object.values(RATE_LIMITS)) {
        expect(config.requests).toBeGreaterThan(0);
        expect(config.windowMs).toBeGreaterThan(0);
      }
    });
  });
});
