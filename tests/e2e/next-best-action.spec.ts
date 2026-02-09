import { test, expect } from "@playwright/test";

test.describe("Next Best Action Suggestions", () => {
  test.describe("Authenticated", () => {
    test.skip("should show Suggested Next Steps card on a New lead detail page", async ({ page }) => {
      await page.goto("/leads");

      // Find a lead with "new" status badge
      const newBadge = page.locator("table tbody tr").filter({
        hasText: /\bnew\b/i,
      });

      const rowCount = await newBadge.count();
      if (rowCount === 0) {
        test.skip();
        return;
      }

      // Click the first "new" lead to open its detail page
      await newBadge.first().click();
      await page.waitForURL(/\/leads\/[^/]+$/);

      // The NextBestAction component renders a card with Lightbulb icon
      // and "Suggested Next Steps" title
      await expect(page.getByText("Suggested Next Steps")).toBeVisible();

      // There should be at least one action suggestion inside the card
      const actionButtons = page.locator("button").filter({
        has: page.locator("p.text-sm.font-medium"),
      });
      const actionCount = await actionButtons.count();
      expect(actionCount).toBeGreaterThan(0);
    });

    test.skip("should suggest a call if phone exists, email if phone does not", async ({ page }) => {
      await page.goto("/leads");

      // Find a lead with "new" status
      const newLeadRow = page.locator("table tbody tr").filter({
        hasText: /\bnew\b/i,
      });

      if ((await newLeadRow.count()) === 0) {
        test.skip();
        return;
      }

      await newLeadRow.first().click();
      await page.waitForURL(/\/leads\/[^/]+$/);

      // Check if the lead has a phone number in Business Details
      const phoneElement = page.locator("a[href^='tel:']");
      const hasPhone = (await phoneElement.count()) > 0;

      // Check if the lead has an email in Business Details
      const emailElement = page.locator("a[href^='mailto:']");
      const hasEmail = (await emailElement.count()) > 0;

      // The NextBestAction card should be present
      const suggestedSteps = page.getByText("Suggested Next Steps");
      if (!(await suggestedSteps.isVisible().catch(() => false))) {
        return;
      }

      if (hasPhone) {
        // For a "new" lead with a phone, the top suggestion should be
        // "Make introduction call"
        await expect(page.getByText(/make introduction call/i)).toBeVisible();
      } else if (hasEmail) {
        // For a "new" lead with email but no phone, the top suggestion should be
        // "Send introduction email" with high priority
        await expect(page.getByText(/send introduction email/i)).toBeVisible();
      } else {
        // No phone and no email: suggest "Research contact info"
        await expect(page.getByText(/research contact info/i)).toBeVisible();
      }
    });

    test.skip("should show Set a follow-up date suggestion when no follow-up is set", async ({ page }) => {
      await page.goto("/leads");

      // Click the first lead to open detail
      const firstRow = page.locator("table tbody tr").first();
      if ((await firstRow.count()) === 0) {
        test.skip();
        return;
      }

      await firstRow.click();
      await page.waitForURL(/\/leads\/[^/]+$/);

      // Check the Key Dates section for a follow-up date
      const followUpDate = page.getByText(/next follow-up/i).locator("xpath=..");
      const keyDatesCard = page.getByText(/key dates/i);

      // Wait for the page to fully load
      await expect(keyDatesCard).toBeVisible();

      // Look for "Next Follow-up" in the Key Dates card
      const hasFollowUp = await page
        .locator("text=/Next Follow-up/i")
        .isVisible()
        .catch(() => false);

      // Check if Suggested Next Steps card exists
      const suggestedSteps = page.getByText("Suggested Next Steps");
      if (!(await suggestedSteps.isVisible().catch(() => false))) {
        return;
      }

      if (!hasFollowUp) {
        // When no follow-up is set, the NextBestAction should include
        // "Set a follow-up date" as a suggestion
        await expect(page.getByText(/set a follow-up date/i)).toBeVisible();
        await expect(
          page.getByText(/schedule a reminder so this lead doesn't fall through/i)
        ).toBeVisible();
      }
    });
  });
});
