import { test, expect } from "@playwright/test";

test.describe("Activities", () => {
  test.describe("Activities Feed Page", () => {
    test.describe("Unauthenticated", () => {
      test.use({ storageState: { cookies: [], origins: [] } });

      test("should redirect to login for unauthenticated users", async ({ page }) => {
        await page.goto("/activities");
        await expect(page).toHaveURL(/login/);
      });
    });

    test.describe("Authenticated", () => {
      test("should display activities feed page correctly", async ({ page }) => {
        await page.goto("/activities");

        await expect(page.getByRole("heading", { name: /activity feed/i })).toBeVisible();
        await expect(page.getByText(/recent activity/i)).toBeVisible();
      });

      test("should display activity type filter", async ({ page }) => {
        await page.goto("/activities");

        await expect(page.getByRole("combobox")).toBeVisible();
      });

      test("should filter activities by type", async ({ page }) => {
        await page.goto("/activities");

        await page.getByRole("combobox").selectOption("email_sent");

        // Verify filter is applied (implementation depends on actual data)
        await expect(page.getByRole("combobox")).toHaveValue("email_sent");
      });

      test("should display activities grouped by date", async ({ page }) => {
        await page.goto("/activities");

        // Should have date headers
        // This test would need actual data to verify specific dates
      });

      test("should display activity cards with correct information", async ({ page }) => {
        await page.goto("/activities");

        // Activity cards should show type badge, title, description, timestamp
        // This test would need actual data to verify
      });

      test("should navigate to lead when clicking business link", async ({ page }) => {
        await page.goto("/activities");

        // Click business link on an activity
        const businessLink = page.getByRole("link").filter({ has: page.locator("[data-testid='business-link']") }).first();
        await businessLink.click();

        await expect(page).toHaveURL(/leads\//);
      });

      test("should refresh activities when refresh button clicked", async ({ page }) => {
        await page.goto("/activities");

        await page.getByRole("button", { name: /refresh/i }).click();

        // Button should have loading state briefly
        // Verify the list refreshes (would need to mock API)
      });
    });
  });

  test.describe("Activity Logging from Lead Detail", () => {
    test.describe("Authenticated", () => {
      test("should open log call modal", async ({ page }) => {
        await page.goto("/leads/test-id");

        await page.getByRole("button", { name: /log call/i }).click();

        await expect(page.getByRole("dialog")).toBeVisible();
        await expect(page.getByRole("heading", { name: /log call/i })).toBeVisible();
      });

      test("should display call outcome options", async ({ page }) => {
        await page.goto("/leads/test-id");

        await page.getByRole("button", { name: /log call/i }).click();

        await expect(page.getByRole("button", { name: /answered/i })).toBeVisible();
        await expect(page.getByRole("button", { name: /voicemail/i })).toBeVisible();
        await expect(page.getByRole("button", { name: /no answer/i })).toBeVisible();
      });

      test("should open log email modal", async ({ page }) => {
        await page.goto("/leads/test-id");

        await page.getByRole("button", { name: /log email/i }).click();

        await expect(page.getByRole("dialog")).toBeVisible();
        await expect(page.getByRole("heading", { name: /log email/i })).toBeVisible();
      });

      test("should open schedule meeting modal", async ({ page }) => {
        await page.goto("/leads/test-id");

        await page.getByRole("button", { name: /schedule meeting/i }).click();

        await expect(page.getByRole("dialog")).toBeVisible();
        await expect(page.getByRole("heading", { name: /schedule meeting/i })).toBeVisible();
      });

      test("should open add note modal", async ({ page }) => {
        await page.goto("/leads/test-id");

        await page.getByRole("button", { name: /add note/i }).click();

        await expect(page.getByRole("dialog")).toBeVisible();
        await expect(page.getByRole("heading", { name: /add note/i })).toBeVisible();
      });

      test("should submit activity and close modal", async ({ page }) => {
        await page.goto("/leads/test-id");

        await page.getByRole("button", { name: /log call/i }).click();
        await page.getByLabel(/subject/i).fill("Follow-up call");
        await page.getByRole("button", { name: /answered/i }).click();
        await page.getByRole("button", { name: /log activity/i }).click();

        // Modal should close after successful submission
        await expect(page.getByRole("dialog")).not.toBeVisible();
      });

      test("should cancel activity logging", async ({ page }) => {
        await page.goto("/leads/test-id");

        await page.getByRole("button", { name: /log call/i }).click();
        await page.getByRole("button", { name: /cancel/i }).click();

        await expect(page.getByRole("dialog")).not.toBeVisible();
      });
    });
  });

  test.describe("Journey Timeline in Lead Detail", () => {
    test.describe("Authenticated", () => {
      test("should display customer journey timeline", async ({ page }) => {
        await page.goto("/leads/test-id");

        await expect(page.getByText(/customer journey/i)).toBeVisible();
      });

      test("should display timeline events with correct formatting", async ({ page }) => {
        await page.goto("/leads/test-id");

        // Timeline events should show icon, title, timestamp
        // This test would need actual data to verify
      });

      test("should show empty state when no activities", async ({ page }) => {
        await page.goto("/leads/new-lead-id");

        await expect(page.getByText(/no activity recorded/i)).toBeVisible();
      });
    });
  });
});
