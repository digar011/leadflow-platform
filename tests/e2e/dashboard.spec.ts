import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test.describe("Unauthenticated", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("should redirect to login when not authenticated", async ({ page }) => {
      await page.goto("/dashboard");
      await expect(page).toHaveURL(/login/);
    });
  });

  test.describe("Authenticated", () => {
    test("should display dashboard page correctly", async ({ page }) => {
      await page.goto("/dashboard");

      await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
    });

    test("should display date range selector", async ({ page }) => {
      await page.goto("/dashboard");

      await expect(page.getByRole("button", { name: /last 30 days/i })).toBeVisible();
    });

    test("should change date range", async ({ page }) => {
      await page.goto("/dashboard");

      await page.getByRole("button", { name: /last 30 days/i }).click();
      await page.getByText(/this month/i).click();

      await expect(page.getByRole("button", { name: /this month/i })).toBeVisible();
    });

    test("should display KPI cards", async ({ page }) => {
      await page.goto("/dashboard");

      await expect(page.getByText("Total Leads")).toBeVisible({ timeout: 10000 });
      await expect(page.getByText("New This Week")).toBeVisible();
      await expect(page.getByText("Pipeline Value")).toBeVisible();
      await expect(page.getByText("Conversion Rate")).toBeVisible();
    });

    test("should display leads trend chart", async ({ page }) => {
      await page.goto("/dashboard");

      await expect(page.getByText(/new leads \(30 days\)/i)).toBeVisible();
    });

    test("should display revenue trend chart", async ({ page }) => {
      await page.goto("/dashboard");

      await expect(page.getByText(/won revenue/i)).toBeVisible();
    });

    test("should display pipeline overview chart", async ({ page }) => {
      await page.goto("/dashboard");

      await expect(page.getByText(/pipeline overview/i)).toBeVisible();
    });

    test("should display lead sources chart", async ({ page }) => {
      await page.goto("/dashboard");

      await expect(page.getByText(/lead sources/i)).toBeVisible();
    });

    test("should display activity heatmap", async ({ page }) => {
      await page.goto("/dashboard");

      await expect(page.getByText(/activity heatmap/i)).toBeVisible();
    });

    test("should display recent activity feed", async ({ page }) => {
      await page.goto("/dashboard");

      await expect(page.getByText(/recent activity/i)).toBeVisible();
      await expect(page.getByRole("link", { name: /view all/i })).toBeVisible();
    });

    test("should display quick actions panel", async ({ page }) => {
      await page.goto("/dashboard");

      await expect(page.getByText(/quick actions/i)).toBeVisible();
      await expect(page.getByRole("main").getByText(/add lead/i)).toBeVisible();
      await expect(page.getByRole("main").getByText(/log call/i)).toBeVisible();
      await expect(page.getByRole("main").getByText(/send email/i)).toBeVisible();
      await expect(page.getByRole("main").getByText(/meeting/i)).toBeVisible();
    });

    test("should navigate to add lead from quick actions", async ({ page }) => {
      await page.goto("/dashboard");

      await page.getByRole("main").getByRole("link", { name: /add lead/i }).click();

      await expect(page).toHaveURL(/leads\/new/);
    });

    test("should navigate to view all activities", async ({ page }) => {
      await page.goto("/dashboard");

      await page.getByRole("link", { name: /view all/i }).click();

      await expect(page).toHaveURL(/activities/);
    });

    test("should display quick stats row", async ({ page }) => {
      await page.goto("/dashboard");

      await expect(page.getByText(/deals won/i)).toBeVisible();
      await expect(page.getByText(/revenue won/i)).toBeVisible();
      await expect(page.getByText(/activities today/i)).toBeVisible();
      await expect(page.getByText(/avg deal size/i)).toBeVisible();
    });

    test("should have working sidebar navigation", async ({ page }) => {
      await page.goto("/dashboard");

      const sidebar = page.locator("aside");
      await expect(sidebar.getByRole("link", { name: "Leads" })).toBeVisible();
      await expect(sidebar.getByRole("link", { name: "Contacts" })).toBeVisible();
      await expect(sidebar.getByRole("link", { name: "Activities", exact: true })).toBeVisible();
    });

    test("should toggle sidebar collapse", async ({ page }) => {
      await page.goto("/dashboard");

      const collapseButton = page.locator("button").filter({ has: page.locator('svg[class*="chevron"]') }).first();
      await collapseButton.click();

      const sidebar = page.locator("aside").first();
      await expect(sidebar).toHaveClass(/w-16/);
    });
  });

  test.describe("Charts Interaction", () => {
    test("should show loading states initially", async ({ page }) => {
      await page.goto("/dashboard");

      // Charts should show loading state (multiple charts loading)
      await expect(page.getByText(/loading chart/i).first()).toBeVisible();
    });

    test("should render charts after data loads", async ({ page }) => {
      await page.goto("/dashboard");

      // Wait for charts to render (Recharts containers)
      await expect(page.locator(".recharts-responsive-container").first()).toBeVisible();
    });
  });
});
