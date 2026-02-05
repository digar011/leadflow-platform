import { test, expect } from "@playwright/test";

test.describe("Automation", () => {
  test.describe("Unauthenticated", () => {
    test("should redirect to login when not authenticated", async ({ page }) => {
      await page.goto("/automation");
      await expect(page).toHaveURL(/login/);
    });
  });

  test.describe("Authenticated", () => {
    test.skip("should display automation page", async ({ page }) => {
      await page.goto("/automation");

      await expect(page.getByRole("heading", { name: /automation/i })).toBeVisible();
      await expect(page.getByRole("link", { name: /new rule/i })).toBeVisible();
    });

    test.skip("should display automation stats", async ({ page }) => {
      await page.goto("/automation");

      await expect(page.getByText(/total rules/i)).toBeVisible();
      await expect(page.getByText(/active/i)).toBeVisible();
      await expect(page.getByText(/executions/i)).toBeVisible();
      await expect(page.getByText(/success rate/i)).toBeVisible();
    });

    test.skip("should display recent activity", async ({ page }) => {
      await page.goto("/automation");

      await expect(page.getByText(/recent activity/i)).toBeVisible();
    });

    test.skip("should navigate to new rule page", async ({ page }) => {
      await page.goto("/automation");

      await page.getByRole("link", { name: /new rule/i }).click();

      await expect(page).toHaveURL(/automation\/new/);
    });

    test.skip("should display empty state when no rules", async ({ page }) => {
      await page.goto("/automation");

      await expect(page.getByText(/no automation rules/i)).toBeVisible();
    });

    test.skip("should toggle rule active state", async ({ page }) => {
      await page.goto("/automation");

      // Find and click the toggle button
      const toggleButton = page.getByRole("button").filter({ has: page.locator('svg[class*="play"]') }).first();
      await toggleButton.click();

      // Rule should change state
    });
  });

  test.describe("Rule Management", () => {
    test.skip("should display rule details", async ({ page }) => {
      await page.goto("/automation/test-rule-id");

      await expect(page.getByText(/trigger/i)).toBeVisible();
      await expect(page.getByText(/action/i)).toBeVisible();
    });

    test.skip("should delete rule with confirmation", async ({ page }) => {
      await page.goto("/automation");

      // Click delete button
      const deleteButton = page.getByRole("button").filter({ has: page.locator('svg[class*="trash"]') }).first();
      await deleteButton.click();

      // Confirmation should appear
      await expect(page.getByText(/are you sure/i)).toBeVisible();
    });
  });
});
