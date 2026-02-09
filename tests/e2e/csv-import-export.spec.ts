import { test, expect } from "@playwright/test";

test.describe("CSV Import/Export", () => {
  // These tests require authentication - skip if not set up
  test.skip(
    !process.env.TEST_USER_EMAIL,
    "Requires TEST_USER_EMAIL env var"
  );

  test.describe("Export", () => {
    test("export button is visible on leads page", async ({ page }) => {
      await page.goto("/leads");
      const exportButton = page.getByRole("button", { name: /export/i });
      await expect(exportButton).toBeVisible();
    });

    test("export button shows loading state when clicked", async ({ page }) => {
      await page.goto("/leads");
      const exportButton = page.getByRole("button", { name: /export/i });
      await exportButton.click();
      // Should show either "Exporting..." or an upgrade modal
      const exporting = page.getByText(/exporting/i);
      const upgradeModal = page.getByText(/upgrade/i);
      await expect(exporting.or(upgradeModal)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Import", () => {
    test("import button is visible on leads page", async ({ page }) => {
      await page.goto("/leads");
      const importButton = page.getByRole("button", { name: /import/i });
      await expect(importButton).toBeVisible();
    });

    test("import button opens modal with upload step", async ({ page }) => {
      await page.goto("/leads");
      const importButton = page.getByRole("button", { name: /import/i });
      await importButton.click();

      // Should show upload modal or upgrade modal
      const uploadText = page.getByText(/drop your csv file/i);
      const upgradeModal = page.getByText(/upgrade/i);
      await expect(uploadText.or(upgradeModal)).toBeVisible({ timeout: 5000 });
    });

    test("import modal accepts CSV file and shows mapping step", async ({ page }) => {
      await page.goto("/leads");

      // Click import
      await page.getByRole("button", { name: /import/i }).click();

      // Check if feature-gated
      const uploadText = page.getByText(/drop your csv file/i);
      if (!(await uploadText.isVisible().catch(() => false))) {
        test.skip(true, "CSV import gated for this tier");
        return;
      }

      // Create a test CSV file
      const csvContent = "Business Name,Email,Phone,Status\nAcme Corp,acme@test.com,555-0100,new\nBeta Inc,beta@test.com,555-0200,contacted";

      // Upload via file input
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles({
        name: "test-leads.csv",
        mimeType: "text/csv",
        buffer: Buffer.from(csvContent),
      });

      // Should advance to column mapping step
      await expect(page.getByText(/map columns/i)).toBeVisible({ timeout: 5000 });
      await expect(page.getByText(/2 rows found/i)).toBeVisible();
    });

    test("column mapping auto-detects matching headers", async ({ page }) => {
      await page.goto("/leads");
      await page.getByRole("button", { name: /import/i }).click();

      const uploadText = page.getByText(/drop your csv file/i);
      if (!(await uploadText.isVisible().catch(() => false))) {
        test.skip(true, "CSV import gated for this tier");
        return;
      }

      const csvContent = "Business Name,Email,Status\nTest Co,test@example.com,new";
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles({
        name: "test.csv",
        mimeType: "text/csv",
        buffer: Buffer.from(csvContent),
      });

      // Check that auto-mapping worked (green checkmarks should appear)
      await expect(page.locator("svg.text-green-400")).toHaveCount(3, { timeout: 5000 });
    });
  });
});
