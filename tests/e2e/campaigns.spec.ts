import { test, expect } from "@playwright/test";

test.describe("Campaigns", () => {
  test.describe("Unauthenticated", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("should redirect to login when not authenticated", async ({ page }) => {
      await page.goto("/campaigns");
      await expect(page).toHaveURL(/login/);
    });
  });

  test.describe("Authenticated", () => {
    test("should display campaigns list page", async ({ page }) => {
      await page.goto("/campaigns");

      await expect(page.getByRole("heading", { name: /campaigns/i })).toBeVisible();
      await expect(page.getByRole("link", { name: /new campaign/i })).toBeVisible();
    });

    test("should display campaign stats", async ({ page }) => {
      await page.goto("/campaigns");

      await expect(page.getByText(/total campaigns/i)).toBeVisible();
      await expect(page.getByText(/active/i)).toBeVisible();
      await expect(page.getByText(/completed/i)).toBeVisible();
    });

    test("should display campaign filters", async ({ page }) => {
      await page.goto("/campaigns");

      await expect(page.getByPlaceholder(/search campaigns/i)).toBeVisible();
      await expect(page.getByRole("combobox")).toBeVisible();
    });

    test("should navigate to new campaign page", async ({ page }) => {
      await page.goto("/campaigns");

      await page.getByRole("link", { name: /new campaign/i }).click();

      await expect(page).toHaveURL(/campaigns\/new/);
    });

    test("should display new campaign form", async ({ page }) => {
      await page.goto("/campaigns/new");

      await expect(page.getByRole("heading", { name: /new campaign/i })).toBeVisible();
      await expect(page.getByLabel(/campaign name/i)).toBeVisible();
      await expect(page.getByText(/campaign type/i)).toBeVisible();
      await expect(page.getByRole("button", { name: /create campaign/i })).toBeVisible();
    });

    test("should show validation error for empty campaign name", async ({ page }) => {
      await page.goto("/campaigns/new");

      await page.getByRole("button", { name: /create campaign/i }).click();

      await expect(page.getByText(/name is required/i)).toBeVisible();
    });

    test("should select campaign type", async ({ page }) => {
      await page.goto("/campaigns/new");

      // Click on email campaign type
      await page.getByText(/email/i).first().click();

      // Type should be selected
      await expect(page.locator("button.border-gold")).toBeVisible();
    });
  });

  test.describe("Campaign Detail", () => {
    test("should display campaign details", async ({ page }) => {
      await page.goto("/campaigns/test-id");

      await expect(page.getByRole("button", { name: /edit/i })).toBeVisible();
      await expect(page.getByText(/campaign members/i)).toBeVisible();
    });

    test("should show start campaign button for draft", async ({ page }) => {
      await page.goto("/campaigns/draft-campaign-id");

      await expect(page.getByRole("button", { name: /start campaign/i })).toBeVisible();
    });

    test("should show pause button for active campaign", async ({ page }) => {
      await page.goto("/campaigns/active-campaign-id");

      await expect(page.getByRole("button", { name: /pause/i })).toBeVisible();
    });
  });
});
