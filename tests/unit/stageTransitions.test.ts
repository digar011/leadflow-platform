import {
  STAGE_TRANSITIONS,
  getTransitionRule,
  isReasonRequired,
  STATUS_LABELS,
} from "@/lib/utils/stageTransitions";
import type { LeadStatus } from "@/lib/types/database";

const ALL_STATUSES: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost",
  "do_not_contact",
];

describe("STAGE_TRANSITIONS", () => {
  it("defines rules for all statuses", () => {
    for (const status of ALL_STATUSES) {
      expect(STAGE_TRANSITIONS[status]).toBeDefined();
    }
  });

  it("suggested transitions are a subset of allowed transitions", () => {
    for (const status of ALL_STATUSES) {
      const rule = STAGE_TRANSITIONS[status];
      for (const s of rule.suggested) {
        expect(rule.allowed).toContain(s);
      }
    }
  });
});

describe("getTransitionRule", () => {
  it("returns the correct rule for 'new'", () => {
    const rule = getTransitionRule("new");
    expect(rule.suggested).toEqual(["contacted"]);
    expect(rule.allowed).toContain("contacted");
    expect(rule.allowed).toContain("lost");
  });

  it("'won' has no suggested transitions", () => {
    const rule = getTransitionRule("won");
    expect(rule.suggested).toEqual([]);
    expect(rule.allowed).toEqual(["negotiation"]);
  });

  it("'negotiation' suggests won and lost", () => {
    const rule = getTransitionRule("negotiation");
    expect(rule.suggested).toContain("won");
    expect(rule.suggested).toContain("lost");
  });

  it("'do_not_contact' only allows transition to 'new'", () => {
    const rule = getTransitionRule("do_not_contact");
    expect(rule.allowed).toEqual(["new"]);
  });
});

describe("isReasonRequired", () => {
  it("requires reason for transition to 'won'", () => {
    expect(isReasonRequired("negotiation", "won")).toBe(true);
    expect(isReasonRequired("proposal", "won")).toBe(true);
  });

  it("requires reason for transition to 'lost'", () => {
    expect(isReasonRequired("new", "lost")).toBe(true);
    expect(isReasonRequired("contacted", "lost")).toBe(true);
  });

  it("does not require reason for other transitions", () => {
    expect(isReasonRequired("new", "contacted")).toBe(false);
    expect(isReasonRequired("contacted", "qualified")).toBe(false);
    expect(isReasonRequired("qualified", "proposal")).toBe(false);
  });
});

describe("STATUS_LABELS", () => {
  it("maps all statuses to human-readable labels", () => {
    for (const status of ALL_STATUSES) {
      expect(STATUS_LABELS[status]).toBeDefined();
      expect(typeof STATUS_LABELS[status]).toBe("string");
    }
  });

  it("has correct labels", () => {
    expect(STATUS_LABELS.new).toBe("New");
    expect(STATUS_LABELS.won).toBe("Won");
    expect(STATUS_LABELS.do_not_contact).toBe("Do Not Contact");
  });
});
