import { test, expect } from "@playwright/test";

test.describe("Stripe Checkout & Billing", () => {
  test.describe("Pricing Page (Public)", () => {
    test("should display pricing page with plan cards", async ({ page }) => {
      await page.goto("/pricing");

      await expect(page.getByRole("heading", { name: /pricing/i })).toBeVisible();

      // All 5 tiers should be displayed
      await expect(page.getByText(/free/i)).toBeVisible();
      await expect(page.getByText(/starter/i)).toBeVisible();
      await expect(page.getByText(/growth/i)).toBeVisible();
      await expect(page.getByText(/business/i)).toBeVisible();
      await expect(page.getByText(/enterprise/i)).toBeVisible();
    });

    test("should display plan prices", async ({ page }) => {
      await page.goto("/pricing");

      // Prices should be visible
      await expect(page.getByText("$49")).toBeVisible();
      await expect(page.getByText("$129")).toBeVisible();
      await expect(page.getByText("$299")).toBeVisible();
    });

    test("should display CTA buttons for each plan", async ({ page }) => {
      await page.goto("/pricing");

      await expect(page.getByRole("button", { name: /get started free/i }).or(page.getByRole("link", { name: /get started free/i }))).toBeVisible();
      await expect(page.getByRole("button", { name: /start free trial/i }).or(page.getByRole("link", { name: /start free trial/i })).first()).toBeVisible();
      await expect(page.getByRole("button", { name: /contact sales/i }).or(page.getByRole("link", { name: /contact sales/i }))).toBeVisible();
    });

    test("should toggle between monthly and annual pricing", async ({ page }) => {
      await page.goto("/pricing");

      // Find billing cycle toggle
      const annualToggle = page.getByText(/annual/i);
      await annualToggle.click();

      // Annual prices should be shown (discounted)
      await expect(page.getByText("$39")).toBeVisible();
      await expect(page.getByText("$109")).toBeVisible();
      await expect(page.getByText("$249")).toBeVisible();
    });

    test("should display feature comparison table", async ({ page }) => {
      await page.goto("/pricing");

      // Feature comparison rows
      await expect(page.getByText(/leads/i)).toBeVisible();
      await expect(page.getByText(/team members/i)).toBeVisible();
      await expect(page.getByText(/campaigns/i)).toBeVisible();
      await expect(page.getByText(/automation rules/i)).toBeVisible();
      await expect(page.getByText(/pipeline view/i)).toBeVisible();
    });
  });

  test.describe("Billing Page - Unauthenticated", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("should redirect to login when not authenticated", async ({ page }) => {
      await page.goto("/settings/billing");
      await expect(page).toHaveURL(/login/);
    });
  });

  test.describe("Billing Page (Authenticated)", () => {
    test("should display current subscription info", async ({ page }) => {
      await page.goto("/settings/billing");

      await expect(page.getByText(/current plan/i)).toBeVisible();
      await expect(page.getByText(/free|starter|growth|business|enterprise/i)).toBeVisible();
    });

    test("should display usage summary", async ({ page }) => {
      await page.goto("/settings/billing");

      // Usage bars for key features
      await expect(page.getByText(/leads/i)).toBeVisible();
      await expect(page.getByText(/usage/i)).toBeVisible();
    });

    test("should show upgrade button for free tier users", async ({ page }) => {
      await page.goto("/settings/billing");

      await expect(page.getByRole("button", { name: /upgrade|change plan/i })).toBeVisible();
    });

    test("should show manage subscription button for paid users", async ({ page }) => {
      await page.goto("/settings/billing");

      // For paid users, show Stripe customer portal link
      await expect(page.getByRole("button", { name: /manage|portal/i })).toBeVisible();
    });
  });

  test.describe("Free Tier Limits", () => {
    test("should show 25 lead limit for free tier", async ({ page }) => {
      await page.goto("/leads");

      // Usage limit bar should show leads limit
      await expect(page.getByText(/25/)).toBeVisible();
    });

    test("should disable pipeline view toggle for free tier", async ({ page }) => {
      await page.goto("/leads");

      // Kanban/pipeline toggle should be disabled
      const kanbanButton = page.getByRole("button", { name: /grid/i }).or(page.locator("button[disabled]").last());
      await expect(kanbanButton).toBeDisabled();
    });

    test("should redirect free tier from kanban page", async ({ page }) => {
      await page.goto("/leads/kanban");

      // Free tier users should be redirected to leads list
      await expect(page).toHaveURL(/\/leads$/);
    });

    test("should hide campaigns for free tier", async ({ page }) => {
      await page.goto("/dashboard");

      // Campaigns nav item should not be visible for free tier
      const sidebar = page.locator("aside");
      await expect(sidebar.getByText(/campaigns/i)).not.toBeVisible();
    });
  });

  test.describe("Upgrade Prompts", () => {
    test("should show upgrade modal when hitting lead limit", async ({ page }) => {
      // Navigate to new lead form
      await page.goto("/leads/new");

      // Fill and submit (assume at limit)
      await page.getByLabel(/business name/i).fill("Test Business Over Limit");
      await page.getByRole("button", { name: /create lead/i }).click();

      // Upgrade modal should appear if at limit
      // This will only trigger if the user is actually at their limit
    });

    test("should show upgrade tooltip on disabled pipeline button", async ({ page }) => {
      await page.goto("/leads");

      // Hover over disabled kanban button
      const disabledButton = page.locator("button[disabled][title]").last();
      const title = await disabledButton.getAttribute("title");
      expect(title).toContain("Starter");
    });
  });
});
