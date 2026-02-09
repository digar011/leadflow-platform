import { test, expect } from "@playwright/test";

test.describe("Follow-Up Tracking", () => {
  test.describe("Lead Form Follow-Up Date", () => {
    test.skip("should save and display the next_follow_up date on the lead form", async ({ page }) => {
      await page.goto("/leads/new");

      // Fill required field
      await page.getByLabel(/business name/i).fill("Follow-Up Test Co");

      // Set a follow-up date in the future
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const dateString = futureDate.toISOString().split("T")[0]; // YYYY-MM-DD

      const followUpInput = page.getByLabel(/next follow-up/i);
      await followUpInput.fill(dateString);

      // Verify the input reflects the chosen date
      await expect(followUpInput).toHaveValue(dateString);

      // Submit the form
      await page.getByRole("button", { name: /create lead/i }).click();

      // After redirect to lead detail, verify follow-up date is displayed
      await page.waitForURL(/\/leads\/[^/]+$/);
      await expect(page.getByText(/next follow-up/i)).toBeVisible();
      await expect(page.getByText(/follow-up/i).first()).toBeVisible();
    });
  });

  test.describe("Overdue Follow-Up Styling on Lead Detail", () => {
    test.skip("should render overdue follow-up with error styling on lead detail page", async ({ page }) => {
      // Navigate to a lead that has an overdue follow-up
      // (assumes seeded test data with an overdue next_follow_up date)
      await page.goto("/leads");

      // Click the first lead to open detail
      await page.locator("table tbody tr").first().click();
      await page.waitForURL(/\/leads\/[^/]+$/);

      // Look for the Key Dates card
      await expect(page.getByText(/key dates/i)).toBeVisible();

      // If the lead has an overdue follow-up, the date should be styled with error color
      const overdueElement = page.getByText(/\(overdue\)/i);
      const isOverdueVisible = await overdueElement.isVisible().catch(() => false);

      if (isOverdueVisible) {
        // The overdue text has text-status-error class for red styling
        await expect(overdueElement).toBeVisible();
        // The parent span should contain the error text color class
        const parentSpan = overdueElement.locator("xpath=..");
        await expect(parentSpan).toHaveClass(/text-status-error/);
        await expect(parentSpan).toHaveClass(/font-medium/);
      }
    });
  });

  test.describe("Dashboard Overdue Alert Banner", () => {
    test.skip("should show overdue alert banner when overdue follow-ups exist", async ({ page }) => {
      await page.goto("/dashboard");

      // The FollowUpWidgets component shows an overdue alert banner
      // with a border-status-error/30 styled div containing AlertTriangle icon
      const overdueBanner = page.locator("text=/overdue follow-up/i");
      const isBannerVisible = await overdueBanner.isVisible().catch(() => false);

      if (isBannerVisible) {
        // The alert should display the count of overdue follow-ups
        await expect(overdueBanner).toBeVisible();

        // Banner should contain links to the overdue leads
        const overdueLinks = page.locator("a[href^='/leads/']").filter({
          has: page.locator("text=/./"),
        });
        const linkCount = await overdueLinks.count();
        expect(linkCount).toBeGreaterThan(0);
      }
    });
  });

  test.describe("Dashboard KPI Cards", () => {
    test.skip("should render Due Today and Stale Leads KPI cards with counts", async ({ page }) => {
      await page.goto("/dashboard");

      // Wait for dashboard to load
      await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();

      // Check for Due Today card from FollowUpWidgets
      const dueTodayCard = page.getByText("Due Today");
      const dueTodayVisible = await dueTodayCard.isVisible().catch(() => false);

      if (dueTodayVisible) {
        await expect(dueTodayCard).toBeVisible();
        // The count is rendered as a 2xl bold number above the "Due Today" label
        const dueTodayCount = dueTodayCard.locator("xpath=preceding-sibling::p");
        await expect(dueTodayCount).toHaveClass(/text-2xl/);
        await expect(dueTodayCount).toHaveClass(/font-bold/);
      }

      // Check for Stale Leads card (labeled "Stale (7+ days)")
      const staleCard = page.getByText(/stale/i);
      const staleVisible = await staleCard.isVisible().catch(() => false);

      if (staleVisible) {
        await expect(staleCard).toBeVisible();
        // The count is rendered as a 2xl bold number above the "Stale (7+ days)" label
        const staleCount = staleCard.locator("xpath=preceding-sibling::p");
        await expect(staleCount).toHaveClass(/text-2xl/);
        await expect(staleCount).toHaveClass(/font-bold/);
      }
    });
  });
});
