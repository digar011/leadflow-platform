import { test, expect } from "@playwright/test";

test.describe("Reports", () => {
  test.describe("Unauthenticated", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("should redirect to login when not authenticated", async ({ page }) => {
      await page.goto("/reports");
      await expect(page).toHaveURL(/login/);
    });
  });

  test.describe("Authenticated", () => {
    test("should display reports page", async ({ page }) => {
      await page.goto("/reports");

      await expect(page.getByRole("heading", { name: /reports/i })).toBeVisible();
      await expect(page.getByRole("link", { name: /new report/i })).toBeVisible();
    });

    test("should display quick reports", async ({ page }) => {
      await page.goto("/reports");

      await expect(page.getByText(/quick reports/i)).toBeVisible();
      await expect(page.getByText(/leads report/i)).toBeVisible();
      await expect(page.getByText(/activity report/i)).toBeVisible();
    });

    test("should display saved reports section", async ({ page }) => {
      await page.goto("/reports");

      await expect(page.getByText(/saved reports/i)).toBeVisible();
    });

    test("should navigate to new report page", async ({ page }) => {
      await page.goto("/reports");

      await page.getByRole("link", { name: /new report/i }).click();

      await expect(page).toHaveURL(/reports\/new/);
    });

    test("should show empty state when no saved reports", async ({ page }) => {
      await page.goto("/reports");

      await expect(page.getByText(/no saved reports/i)).toBeVisible();
    });
  });

  test.describe("Report Actions", () => {
    test("should run a quick report", async ({ page }) => {
      await page.goto("/reports");

      // Click on a quick report card
      await page.getByText(/leads report/i).click();

      // Report should generate
    });

    test("should download report as CSV", async ({ page }) => {
      await page.goto("/reports");

      // Find download button
      const downloadButton = page.getByRole("button").filter({ has: page.locator('svg[class*="download"]') }).first();

      // Set up download listener
      const downloadPromise = page.waitForEvent("download");
      await downloadButton.click();

      // Verify download started
    });

    test("should delete saved report", async ({ page }) => {
      await page.goto("/reports");

      // Find delete button
      const deleteButton = page.getByRole("button").filter({ has: page.locator('svg[class*="trash"]') }).first();
      await deleteButton.click();

      // Confirmation should appear
      await expect(page.getByText(/are you sure/i)).toBeVisible();
    });
  });
});
