import { test, expect } from "@playwright/test";

test.describe("Stage Transitions", () => {
  test.describe("Authenticated", () => {
    test("should show StatusTransition component on lead detail page", async ({ page }) => {
      await page.goto("/leads");

      // Click the first lead to open its detail page
      const firstRow = page.locator("table tbody tr").first();
      if ((await firstRow.count()) === 0) {
        test.skip();
        return;
      }

      await firstRow.click();
      await page.waitForURL(/\/leads\/[^/]+$/);

      // The StatusTransition component renders buttons with "Move to" text
      // for the suggested transitions of the current status
      const moveToButtons = page.getByRole("button", { name: /move to/i });
      const moveToCount = await moveToButtons.count();

      // Most statuses have at least one suggested transition
      // (except "won" and "do_not_contact" which have empty suggested arrays)
      // Check that transition controls are present
      const hasTransitions = moveToCount > 0;
      const moreOptionsToggle = page.getByText(/more options/i);
      const hasMoreOptions = await moreOptionsToggle.isVisible().catch(() => false);

      // At least one of these should be true for active leads
      expect(hasTransitions || hasMoreOptions).toBeTruthy();
    });

    test("should show suggested transitions as prominent buttons", async ({ page }) => {
      await page.goto("/leads");

      // Find a lead with "new" status to have predictable suggested transitions
      const newLeadRow = page.locator("table tbody tr").filter({
        hasText: /\bnew\b/i,
      });

      if ((await newLeadRow.count()) === 0) {
        test.skip();
        return;
      }

      await newLeadRow.first().click();
      await page.waitForURL(/\/leads\/[^/]+$/);

      // For a "new" lead, the suggested transition is "contacted"
      // So we should see a "Move to Contacted" button
      const moveToContacted = page.getByRole("button", {
        name: /move to contacted/i,
      });
      await expect(moveToContacted).toBeVisible();

      // The button should have the highlighted border styling
      // (border-gold/30 hover:border-gold/60 hover:bg-gold/10)
      await expect(moveToContacted).toHaveClass(/border-gold/);
    });

    test("should reveal other statuses when More options toggle is clicked", async ({ page }) => {
      await page.goto("/leads");

      // Find a "new" lead which has other allowed transitions beyond "contacted"
      // new -> allowed: ["contacted", "qualified", "lost", "do_not_contact"]
      // new -> suggested: ["contacted"]
      // So "More options" should show "qualified", "lost", "do_not_contact"
      const newLeadRow = page.locator("table tbody tr").filter({
        hasText: /\bnew\b/i,
      });

      if ((await newLeadRow.count()) === 0) {
        test.skip();
        return;
      }

      await newLeadRow.first().click();
      await page.waitForURL(/\/leads\/[^/]+$/);

      // Click "More options" toggle
      const moreOptionsToggle = page.getByText(/more options/i);
      await expect(moreOptionsToggle).toBeVisible();
      await moreOptionsToggle.click();

      // The toggle text should change to "Less options"
      await expect(page.getByText(/less options/i)).toBeVisible();

      // The other statuses should now be visible as ghost buttons
      // For "new" status, other allowed transitions are: qualified, lost, do_not_contact
      await expect(page.getByRole("button", { name: "Qualified" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Lost" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Do Not Contact" })).toBeVisible();
    });

    test("should open a reason modal when moving to Won or Lost", async ({ page }) => {
      await page.goto("/leads");

      // Find a lead in "negotiation" status which has "won" and "lost" as suggested
      // negotiation -> suggested: ["won", "lost"]
      const negotiationRow = page.locator("table tbody tr").filter({
        hasText: /negotiation/i,
      });

      let leadRow = negotiationRow;

      if ((await negotiationRow.count()) === 0) {
        // Fallback: find a "new" lead and use "More options" to access "Lost"
        const newLeadRow = page.locator("table tbody tr").filter({
          hasText: /\bnew\b/i,
        });

        if ((await newLeadRow.count()) === 0) {
          test.skip();
          return;
        }

        await newLeadRow.first().click();
        await page.waitForURL(/\/leads\/[^/]+$/);

        // Open "More options" to access "Lost"
        const moreOptions = page.getByText(/more options/i);
        if (await moreOptions.isVisible().catch(() => false)) {
          await moreOptions.click();
        }

        // Click "Lost" button
        const lostButton = page.getByRole("button", { name: "Lost" });
        if (await lostButton.isVisible().catch(() => false)) {
          await lostButton.click();

          // A modal should open asking for a reason
          const modal = page.getByRole("dialog");
          await expect(modal).toBeVisible();

          // The modal should have the title "Mark as Lost"
          await expect(page.getByText("Mark as Lost")).toBeVisible();

          // The modal should ask "Why was this lead lost?"
          await expect(page.getByText(/why was this lead lost/i)).toBeVisible();

          // There should be a textarea for entering the reason
          const reasonTextarea = modal.locator("textarea");
          await expect(reasonTextarea).toBeVisible();

          // The submit button should be disabled when reason is empty
          const submitButton = page.getByRole("button", { name: /mark as lost/i });
          await expect(submitButton).toBeDisabled();

          // Type a reason
          await reasonTextarea.fill("Went with a competitor");
          await expect(submitButton).toBeEnabled();

          // Cancel to avoid actually changing the status
          await page.getByRole("button", { name: /cancel/i }).click();
          await expect(modal).not.toBeVisible();
        }

        return;
      }

      // If we found a negotiation lead, test with "Won"
      await leadRow.first().click();
      await page.waitForURL(/\/leads\/[^/]+$/);

      // Click "Move to Won" button (suggested for negotiation)
      const wonButton = page.getByRole("button", { name: /move to won/i });
      await expect(wonButton).toBeVisible();
      await wonButton.click();

      // A modal should open
      const modal = page.getByRole("dialog");
      await expect(modal).toBeVisible();

      // The modal title should be "Deal Won!"
      await expect(page.getByText("Deal Won!")).toBeVisible();

      // The modal should ask what helped close this deal
      await expect(page.getByText(/what helped close this deal/i)).toBeVisible();

      // There should be a textarea
      const reasonTextarea = modal.locator("textarea");
      await expect(reasonTextarea).toBeVisible();
      await expect(reasonTextarea).toHaveAttribute(
        "placeholder",
        /price matched budget/i
      );

      // Submit button should be disabled with empty reason
      const markWonButton = page.getByRole("button", { name: /mark as won/i });
      await expect(markWonButton).toBeDisabled();

      // Fill reason and verify button becomes enabled
      await reasonTextarea.fill("Strong product fit and competitive pricing");
      await expect(markWonButton).toBeEnabled();

      // Cancel to avoid mutating test data
      await page.getByRole("button", { name: /cancel/i }).click();
      await expect(modal).not.toBeVisible();
    });
  });
});
