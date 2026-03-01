import { getNextBestActions } from "@/lib/utils/nextBestAction";

describe("getNextBestActions", () => {
  it("suggests intro call for new lead with phone", () => {
    const actions = getNextBestActions({
      status: "new",
      temperature: "cold",
      daysSinceLastActivity: null,
      hasFollowUp: false,
      hasEmail: true,
      hasPhone: true,
      hasDealValue: false,
    });
    expect(actions.some((a) => a.id === "intro-call")).toBe(true);
  });

  it("suggests intro email for new lead without phone", () => {
    const actions = getNextBestActions({
      status: "new",
      temperature: "cold",
      daysSinceLastActivity: null,
      hasFollowUp: false,
      hasEmail: true,
      hasPhone: false,
      hasDealValue: false,
    });
    const emailAction = actions.find((a) => a.id === "intro-email");
    expect(emailAction).toBeDefined();
    expect(emailAction?.priority).toBe("high");
  });

  it("suggests research for new lead without contact info", () => {
    const actions = getNextBestActions({
      status: "new",
      temperature: "cold",
      daysSinceLastActivity: null,
      hasFollowUp: false,
      hasEmail: false,
      hasPhone: false,
      hasDealValue: false,
    });
    expect(actions.some((a) => a.id === "research")).toBe(true);
  });

  it("suggests follow-up for contacted lead with 3+ days inactivity", () => {
    const actions = getNextBestActions({
      status: "contacted",
      temperature: "warm",
      daysSinceLastActivity: 5,
      hasFollowUp: false,
      hasEmail: true,
      hasPhone: true,
      hasDealValue: false,
    });
    expect(actions.some((a) => a.id === "follow-up")).toBe(true);
  });

  it("suggests scheduling a meeting for qualified leads", () => {
    const actions = getNextBestActions({
      status: "qualified",
      temperature: "warm",
      daysSinceLastActivity: 1,
      hasFollowUp: true,
      hasEmail: true,
      hasPhone: true,
      hasDealValue: true,
    });
    expect(actions.some((a) => a.id === "schedule-meeting")).toBe(true);
  });

  it("suggests setting deal value for qualified leads without one", () => {
    const actions = getNextBestActions({
      status: "qualified",
      temperature: "warm",
      daysSinceLastActivity: 1,
      hasFollowUp: true,
      hasEmail: true,
      hasPhone: true,
      hasDealValue: false,
    });
    expect(actions.some((a) => a.id === "set-deal-value")).toBe(true);
  });

  it("suggests follow-up on proposal", () => {
    const actions = getNextBestActions({
      status: "proposal",
      temperature: "warm",
      daysSinceLastActivity: 2,
      hasFollowUp: true,
      hasEmail: true,
      hasPhone: true,
      hasDealValue: true,
    });
    expect(actions.some((a) => a.id === "follow-up-proposal")).toBe(true);
  });

  it("suggests addressing objections and closing for negotiation", () => {
    const actions = getNextBestActions({
      status: "negotiation",
      temperature: "hot",
      daysSinceLastActivity: 0,
      hasFollowUp: true,
      hasEmail: true,
      hasPhone: true,
      hasDealValue: true,
    });
    expect(actions.some((a) => a.id === "address-objections")).toBe(true);
    expect(actions.some((a) => a.id === "close-deal")).toBe(true);
  });

  it("adds follow-up suggestion when no follow-up is set", () => {
    const actions = getNextBestActions({
      status: "contacted",
      temperature: "cold",
      daysSinceLastActivity: 1,
      hasFollowUp: false,
      hasEmail: true,
      hasPhone: true,
      hasDealValue: false,
    });
    expect(actions.some((a) => a.id === "set-follow-up")).toBe(true);
  });

  it("does not add follow-up for won leads", () => {
    const actions = getNextBestActions({
      status: "won",
      temperature: "hot",
      daysSinceLastActivity: 0,
      hasFollowUp: false,
      hasEmail: true,
      hasPhone: true,
      hasDealValue: true,
    });
    expect(actions.some((a) => a.id === "set-follow-up")).toBe(false);
  });

  it("adds hot lead urgency for inactive hot leads", () => {
    const actions = getNextBestActions({
      status: "contacted",
      temperature: "hot",
      daysSinceLastActivity: 3,
      hasFollowUp: true,
      hasEmail: true,
      hasPhone: true,
      hasDealValue: true,
    });
    expect(actions[0].id).toBe("hot-urgent");
    expect(actions[0].priority).toBe("high");
  });

  it("limits results to max 3 actions", () => {
    const actions = getNextBestActions({
      status: "new",
      temperature: "hot",
      daysSinceLastActivity: 5,
      hasFollowUp: false,
      hasEmail: true,
      hasPhone: true,
      hasDealValue: false,
    });
    expect(actions.length).toBeLessThanOrEqual(3);
  });
});
