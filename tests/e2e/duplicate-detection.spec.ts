import { test, expect } from "@playwright/test";

test.describe("Duplicate Lead Detection", () => {
  test.describe("Authenticated", () => {
    test("should show no duplicate warning for a unique business name", async ({ page }) => {
      await page.goto("/leads/new");

      // Type a unique business name that does not exist
      const uniqueName = `Unique Test Corp ${Date.now()}`;
      await page.getByLabel(/business name/i).fill(uniqueName);

      // Wait briefly for the duplicate check debounce/query to settle
      await page.waitForTimeout(1500);

      // The DuplicateWarning component should NOT be present
      const duplicateWarning = page.getByText(/possible duplicate/i);
      await expect(duplicateWarning).not.toBeVisible();
    });

    test("should show DuplicateWarning when typing a name matching an existing lead", async ({ page }) => {
      // First, we need to know an existing lead name. Navigate to leads list to find one.
      await page.goto("/leads");
      const firstLeadName = await page
        .locator("table tbody tr td")
        .first()
        .textContent();

      if (!firstLeadName) {
        test.skip();
        return;
      }

      // Now go to create a new lead
      await page.goto("/leads/new");

      // Type the existing lead's business name
      await page.getByLabel(/business name/i).fill(firstLeadName.trim());

      // Wait for the duplicate check API call (hook fires when name >= 3 chars)
      await page.waitForTimeout(2000);

      // The DuplicateWarning should appear with AlertTriangle icon
      const duplicateWarning = page.getByText(/possible duplicate/i);
      await expect(duplicateWarning).toBeVisible();

      // The warning text should include "Possible duplicate" (singular or plural)
      await expect(page.getByText(/possible duplicate/i)).toBeVisible();
    });

    test("should include a link to the existing lead detail in the warning", async ({ page }) => {
      // Navigate to leads list to get an existing lead name
      await page.goto("/leads");
      const firstLeadName = await page
        .locator("table tbody tr td")
        .first()
        .textContent();

      if (!firstLeadName) {
        test.skip();
        return;
      }

      await page.goto("/leads/new");
      await page.getByLabel(/business name/i).fill(firstLeadName.trim());

      // Wait for duplicate check
      await page.waitForTimeout(2000);

      // The warning should be visible
      await expect(page.getByText(/possible duplicate/i)).toBeVisible();

      // Each duplicate match is rendered as a Link to /leads/{id}
      const duplicateLink = page.locator("a[href^='/leads/']").filter({
        hasText: firstLeadName.trim(),
      });
      await expect(duplicateLink.first()).toBeVisible();

      // Verify the link points to a lead detail page
      const href = await duplicateLink.first().getAttribute("href");
      expect(href).toMatch(/^\/leads\/[a-zA-Z0-9-]+$/);
    });

    test("should still allow form submission despite duplicate warning", async ({ page }) => {
      // Navigate to leads list to get an existing lead name
      await page.goto("/leads");
      const firstLeadName = await page
        .locator("table tbody tr td")
        .first()
        .textContent();

      if (!firstLeadName) {
        test.skip();
        return;
      }

      await page.goto("/leads/new");
      await page.getByLabel(/business name/i).fill(firstLeadName.trim());

      // Wait for duplicate check
      await page.waitForTimeout(2000);

      // Warning should be visible
      await expect(page.getByText(/possible duplicate/i)).toBeVisible();

      // The info text should tell the user they can still create
      await expect(
        page.getByText(/you can still create this lead/i)
      ).toBeVisible();

      // The Create Lead button should still be enabled and clickable
      const submitButton = page.getByRole("button", { name: /create lead/i });
      await expect(submitButton).toBeEnabled();

      // Click submit - form should process (may redirect or show error for
      // missing required fields, but the button itself is not disabled by the warning)
      await submitButton.click();

      // The form submission should proceed - if there are validation errors
      // they would be from missing fields, NOT from the duplicate warning
      // which is purely informational
    });
  });
});
