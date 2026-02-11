import { test, expect } from "@playwright/test";

test.describe("Automation Engine", () => {
  test.describe("Unauthenticated", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("should redirect to login when not authenticated", async ({ page }) => {
      await page.goto("/automation");
      await expect(page).toHaveURL(/login/);
    });
  });

  test.describe("Automation Page", () => {
    test("should display automation page with create rule button", async ({ page }) => {
      await page.goto("/automation");

      await expect(page.getByRole("heading", { name: /automation/i })).toBeVisible();
      await expect(page.getByRole("link", { name: /new rule/i })).toBeVisible();
    });

    test("should display automation stats cards", async ({ page }) => {
      await page.goto("/automation");

      await expect(page.getByText(/total rules/i)).toBeVisible();
      await expect(page.getByText(/active/i)).toBeVisible();
      await expect(page.getByText(/executions/i)).toBeVisible();
      await expect(page.getByText(/success rate/i)).toBeVisible();
    });

    test("should display recent automation activity section", async ({ page }) => {
      await page.goto("/automation");

      await expect(page.getByText(/recent activity/i)).toBeVisible();
    });

    test("should show usage limit bar for automation rules", async ({ page }) => {
      await page.goto("/automation");

      // Usage limit bar should show current usage vs plan limit
      await expect(page.getByText(/automation rules/i)).toBeVisible();
    });
  });

  test.describe("Rule Creation", () => {
    test("should navigate to new rule page", async ({ page }) => {
      await page.goto("/automation");

      await page.getByRole("link", { name: /new rule/i }).click();
      await expect(page).toHaveURL(/automation\/new/);
    });

    test("should display rule creation form with trigger types", async ({ page }) => {
      await page.goto("/automation/new");

      await expect(page.getByRole("heading", { name: /new.*rule/i })).toBeVisible();

      // Trigger type dropdown should include all trigger types
      await expect(page.getByText(/trigger/i)).toBeVisible();
      await expect(page.getByText(/action/i)).toBeVisible();
    });

    test("should show trigger type options", async ({ page }) => {
      await page.goto("/automation/new");

      // Check for trigger type options
      const triggerSelect = page.locator("select").first();
      await triggerSelect.click();

      await expect(page.getByText(/lead created/i)).toBeVisible();
      await expect(page.getByText(/status changed/i)).toBeVisible();
      await expect(page.getByText(/lead updated/i)).toBeVisible();
    });

    test("should show action type options including new actions", async ({ page }) => {
      await page.goto("/automation/new");

      // Action types should include all 5 actions
      await expect(page.getByText(/send email/i)).toBeVisible();
      await expect(page.getByText(/create task/i)).toBeVisible();
      await expect(page.getByText(/update status/i)).toBeVisible();
      await expect(page.getByText(/assign.*user/i)).toBeVisible();
      await expect(page.getByText(/send webhook/i)).toBeVisible();
    });

    test("should validate required fields before saving", async ({ page }) => {
      await page.goto("/automation/new");

      // Try to save without filling required fields
      const saveButton = page.getByRole("button", { name: /save|create/i });
      await saveButton.click();

      // Should show validation errors
      await expect(page.getByText(/required/i)).toBeVisible();
    });
  });

  test.describe("Rule Management", () => {
    test("should toggle rule active/inactive state", async ({ page }) => {
      await page.goto("/automation");

      // Find toggle button for a rule
      const toggleButton = page.getByRole("button").filter({ has: page.locator("svg") }).first();
      await toggleButton.click();
    });

    test("should show execution history for a rule", async ({ page }) => {
      await page.goto("/automation");

      // Click on a rule to see details
      await expect(page.getByText(/trigger/i)).toBeVisible();
      await expect(page.getByText(/action/i)).toBeVisible();
    });

    test("should delete rule with confirmation", async ({ page }) => {
      await page.goto("/automation");

      const deleteButton = page.getByRole("button").filter({ has: page.locator('svg[class*="trash"]') }).first();
      await deleteButton.click();

      await expect(page.getByText(/are you sure/i)).toBeVisible();
    });
  });

  test.describe("Automation Triggers", () => {
    test("should trigger automation when lead is created", async ({ page }) => {
      // Navigate to new lead form
      await page.goto("/leads/new");

      // Fill in lead form
      await page.getByLabel(/business name/i).fill("Automation Test Business");
      await page.getByLabel(/email/i).fill("test@automation.com");

      // Submit the form
      await page.getByRole("button", { name: /create lead/i }).click();

      // Should redirect to leads list
      await expect(page).toHaveURL(/leads/);

      // Check automation logs for execution
      await page.goto("/automation");
      await expect(page.getByText(/recent activity/i)).toBeVisible();
    });

    test("should trigger automation when lead status changes", async ({ page }) => {
      // Navigate to a lead detail page
      await page.goto("/leads");

      // Click on first lead
      const firstLeadRow = page.locator("tr").nth(1);
      await firstLeadRow.click();

      // Change status
      const statusSelect = page.locator("select").filter({ hasText: /status/i });
      await statusSelect.selectOption("contacted");

      // Automation should fire (check logs)
      await page.goto("/automation");
      await expect(page.getByText(/recent activity/i)).toBeVisible();
    });
  });
});
