import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test.describe("Unauthenticated", () => {
    test("should redirect to login when not authenticated", async ({ page }) => {
      await page.goto("/dashboard");
      await expect(page).toHaveURL(/login/);
    });
  });

  test.describe("Authenticated", () => {
    // Note: These tests require authentication setup
    test.skip("should display dashboard page correctly", async ({ page }) => {
      await page.goto("/dashboard");

      await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
    });

    test.skip("should display date range selector", async ({ page }) => {
      await page.goto("/dashboard");

      await expect(page.getByRole("button", { name: /last 30 days/i })).toBeVisible();
    });

    test.skip("should change date range", async ({ page }) => {
      await page.goto("/dashboard");

      await page.getByRole("button", { name: /last 30 days/i }).click();
      await page.getByText(/this month/i).click();

      await expect(page.getByRole("button", { name: /this month/i })).toBeVisible();
    });

    test.skip("should display KPI cards", async ({ page }) => {
      await page.goto("/dashboard");

      await expect(page.getByText(/total leads/i)).toBeVisible();
      await expect(page.getByText(/new this week/i)).toBeVisible();
      await expect(page.getByText(/pipeline value/i)).toBeVisible();
      await expect(page.getByText(/conversion rate/i)).toBeVisible();
    });

    test.skip("should display leads trend chart", async ({ page }) => {
      await page.goto("/dashboard");

      await expect(page.getByText(/new leads \(30 days\)/i)).toBeVisible();
    });

    test.skip("should display revenue trend chart", async ({ page }) => {
      await page.goto("/dashboard");

      await expect(page.getByText(/won revenue/i)).toBeVisible();
    });

    test.skip("should display pipeline overview chart", async ({ page }) => {
      await page.goto("/dashboard");

      await expect(page.getByText(/pipeline overview/i)).toBeVisible();
    });

    test.skip("should display lead sources chart", async ({ page }) => {
      await page.goto("/dashboard");

      await expect(page.getByText(/lead sources/i)).toBeVisible();
    });

    test.skip("should display activity heatmap", async ({ page }) => {
      await page.goto("/dashboard");

      await expect(page.getByText(/activity heatmap/i)).toBeVisible();
    });

    test.skip("should display recent activity feed", async ({ page }) => {
      await page.goto("/dashboard");

      await expect(page.getByText(/recent activity/i)).toBeVisible();
      await expect(page.getByRole("link", { name: /view all/i })).toBeVisible();
    });

    test.skip("should display quick actions panel", async ({ page }) => {
      await page.goto("/dashboard");

      await expect(page.getByText(/quick actions/i)).toBeVisible();
      await expect(page.getByText(/add lead/i)).toBeVisible();
      await expect(page.getByText(/log call/i)).toBeVisible();
      await expect(page.getByText(/send email/i)).toBeVisible();
      await expect(page.getByText(/meeting/i)).toBeVisible();
    });

    test.skip("should navigate to add lead from quick actions", async ({ page }) => {
      await page.goto("/dashboard");

      await page.getByRole("link", { name: /add lead/i }).click();

      await expect(page).toHaveURL(/leads\/new/);
    });

    test.skip("should navigate to view all activities", async ({ page }) => {
      await page.goto("/dashboard");

      await page.getByRole("link", { name: /view all/i }).click();

      await expect(page).toHaveURL(/activities/);
    });

    test.skip("should display quick stats row", async ({ page }) => {
      await page.goto("/dashboard");

      await expect(page.getByText(/deals won/i)).toBeVisible();
      await expect(page.getByText(/revenue won/i)).toBeVisible();
      await expect(page.getByText(/activities today/i)).toBeVisible();
      await expect(page.getByText(/avg deal size/i)).toBeVisible();
    });

    test.skip("should have working sidebar navigation", async ({ page }) => {
      await page.goto("/dashboard");

      const sidebarLinks = [
        { name: "Leads", url: "/leads" },
        { name: "Contacts", url: "/contacts" },
        { name: "Activities", url: "/activities" },
      ];

      for (const link of sidebarLinks) {
        const navLink = page.getByRole("link", { name: link.name });
        await expect(navLink).toBeVisible();
      }
    });

    test.skip("should toggle sidebar collapse", async ({ page }) => {
      await page.goto("/dashboard");

      const collapseButton = page.locator("button").filter({ has: page.locator('svg[class*="chevron"]') }).first();
      await collapseButton.click();

      const sidebar = page.locator("aside").first();
      await expect(sidebar).toHaveClass(/w-16/);
    });
  });

  test.describe("Charts Interaction", () => {
    test.skip("should show loading states initially", async ({ page }) => {
      await page.goto("/dashboard");

      // Charts should show loading state
      await expect(page.getByText(/loading chart/i)).toBeVisible();
    });

    test.skip("should render charts after data loads", async ({ page }) => {
      await page.goto("/dashboard");

      // Wait for charts to render (Recharts containers)
      await expect(page.locator(".recharts-responsive-container").first()).toBeVisible();
    });
  });
});
