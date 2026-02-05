import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  // Note: These tests require authentication
  // In a real scenario, you would set up authentication in a beforeEach hook

  test.describe("Unauthenticated", () => {
    test("should redirect to login when not authenticated", async ({ page }) => {
      await page.goto("/dashboard");
      await expect(page).toHaveURL(/login/);
    });
  });

  // Placeholder tests for authenticated scenarios
  // These would need proper auth setup to run
  test.describe.skip("Authenticated", () => {
    test("should display welcome message", async ({ page }) => {
      await page.goto("/dashboard");
      await expect(page.getByText(/welcome back/i)).toBeVisible();
    });

    test("should display KPI cards", async ({ page }) => {
      await page.goto("/dashboard");

      await expect(page.getByText(/total leads/i)).toBeVisible();
      await expect(page.getByText(/new this week/i)).toBeVisible();
      await expect(page.getByText(/conversion rate/i)).toBeVisible();
      await expect(page.getByText(/revenue pipeline/i)).toBeVisible();
    });

    test("should display pipeline overview", async ({ page }) => {
      await page.goto("/dashboard");

      await expect(page.getByText(/pipeline overview/i)).toBeVisible();
      await expect(page.getByText(/new/i)).toBeVisible();
      await expect(page.getByText(/contacted/i)).toBeVisible();
      await expect(page.getByText(/qualified/i)).toBeVisible();
    });

    test("should display recent activity feed", async ({ page }) => {
      await page.goto("/dashboard");

      await expect(page.getByText(/recent activity/i)).toBeVisible();
    });

    test("should have working sidebar navigation", async ({ page }) => {
      await page.goto("/dashboard");

      // Test navigation links
      const sidebarLinks = [
        { name: "Leads", url: "/leads" },
        { name: "Contacts", url: "/contacts" },
        { name: "Activities", url: "/activities" },
        { name: "Campaigns", url: "/campaigns" },
        { name: "Analytics", url: "/analytics" },
        { name: "Reports", url: "/reports" },
        { name: "Automation", url: "/automation" },
        { name: "Settings", url: "/settings" },
      ];

      for (const link of sidebarLinks) {
        const navLink = page.getByRole("link", { name: link.name });
        await expect(navLink).toBeVisible();
      }
    });

    test("should toggle sidebar collapse", async ({ page }) => {
      await page.goto("/dashboard");

      // Find and click collapse button
      const collapseButton = page.locator("button").filter({ has: page.locator('svg[class*="chevron"]') }).first();
      await collapseButton.click();

      // Sidebar should be collapsed (narrower width)
      const sidebar = page.locator("aside").first();
      await expect(sidebar).toHaveClass(/w-16/);
    });
  });
});
