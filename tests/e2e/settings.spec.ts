import { test, expect } from "@playwright/test";

test.describe("Settings", () => {
  test.describe("Unauthenticated", () => {
    test("should redirect to login when not authenticated", async ({ page }) => {
      await page.goto("/settings");
      await expect(page).toHaveURL(/login/);
    });
  });

  test.describe("Profile Settings", () => {
    test.skip("should display profile settings page", async ({ page }) => {
      await page.goto("/settings/profile");

      await expect(page.getByRole("heading", { name: /profile settings/i })).toBeVisible();
      await expect(page.getByText(/personal information/i)).toBeVisible();
    });

    test.skip("should display user avatar and info", async ({ page }) => {
      await page.goto("/settings/profile");

      // Avatar section should be visible
      await expect(page.locator("[class*='rounded-full']").first()).toBeVisible();
    });

    test.skip("should update profile information", async ({ page }) => {
      await page.goto("/settings/profile");

      const nameInput = page.getByPlaceholder(/full name/i);
      await nameInput.fill("Updated Name");

      const saveButton = page.getByRole("button", { name: /save/i });
      await saveButton.click();
    });

    test.skip("should show email as read-only", async ({ page }) => {
      await page.goto("/settings/profile");

      const emailInput = page.locator("input[disabled]").first();
      await expect(emailInput).toBeVisible();
    });
  });

  test.describe("Team Settings", () => {
    test.skip("should display team settings page", async ({ page }) => {
      await page.goto("/settings/team");

      await expect(page.getByRole("heading", { name: /team members/i })).toBeVisible();
    });

    test.skip("should display team stats", async ({ page }) => {
      await page.goto("/settings/team");

      await expect(page.getByText(/total members/i)).toBeVisible();
      await expect(page.getByText(/admins/i)).toBeVisible();
    });

    test.skip("should open invite modal", async ({ page }) => {
      await page.goto("/settings/team");

      const inviteButton = page.getByRole("button", { name: /invite member/i });
      await inviteButton.click();

      await expect(page.getByText(/invite team member/i)).toBeVisible();
      await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    });

    test.skip("should display team member list", async ({ page }) => {
      await page.goto("/settings/team");

      // Should have member cards
      await expect(page.getByText(/members/i)).toBeVisible();
    });
  });

  test.describe("Webhooks Settings", () => {
    test.skip("should display webhooks settings page", async ({ page }) => {
      await page.goto("/settings/webhooks");

      await expect(page.getByRole("heading", { name: /webhooks/i })).toBeVisible();
    });

    test.skip("should display webhook stats", async ({ page }) => {
      await page.goto("/settings/webhooks");

      await expect(page.getByText(/total webhooks/i)).toBeVisible();
      await expect(page.getByText(/active/i)).toBeVisible();
      await expect(page.getByText(/deliveries/i)).toBeVisible();
    });

    test.skip("should open create webhook modal", async ({ page }) => {
      await page.goto("/settings/webhooks");

      const createButton = page.getByRole("button", { name: /new webhook/i });
      await createButton.click();

      await expect(page.getByText(/create webhook/i)).toBeVisible();
      await expect(page.getByText(/outbound/i)).toBeVisible();
      await expect(page.getByText(/inbound/i)).toBeVisible();
    });

    test.skip("should select webhook events", async ({ page }) => {
      await page.goto("/settings/webhooks");

      const createButton = page.getByRole("button", { name: /new webhook/i });
      await createButton.click();

      // Event checkboxes should be visible
      await expect(page.getByText(/lead created/i)).toBeVisible();
      await expect(page.getByText(/lead updated/i)).toBeVisible();
    });

    test.skip("should toggle webhook active state", async ({ page }) => {
      await page.goto("/settings/webhooks");

      // If there are webhooks, find the toggle button
      const toggleButton = page.getByRole("button").filter({ has: page.locator("svg") }).first();
    });
  });

  test.describe("API Keys Settings", () => {
    test.skip("should display API keys settings page", async ({ page }) => {
      await page.goto("/settings/api-keys");

      await expect(page.getByRole("heading", { name: /api keys/i })).toBeVisible();
    });

    test.skip("should display security warning", async ({ page }) => {
      await page.goto("/settings/api-keys");

      await expect(page.getByText(/keep your api keys secure/i)).toBeVisible();
    });

    test.skip("should open create API key modal", async ({ page }) => {
      await page.goto("/settings/api-keys");

      const createButton = page.getByRole("button", { name: /new api key/i });
      await createButton.click();

      await expect(page.getByText(/create api key/i)).toBeVisible();
      await expect(page.getByPlaceholder(/my api key/i)).toBeVisible();
    });

    test.skip("should select API key scopes", async ({ page }) => {
      await page.goto("/settings/api-keys");

      const createButton = page.getByRole("button", { name: /new api key/i });
      await createButton.click();

      // Scope checkboxes should be visible
      await expect(page.getByText(/read leads/i)).toBeVisible();
      await expect(page.getByText(/write leads/i)).toBeVisible();
    });

    test.skip("should select expiration option", async ({ page }) => {
      await page.goto("/settings/api-keys");

      const createButton = page.getByRole("button", { name: /new api key/i });
      await createButton.click();

      const expirationSelect = page.locator("select").first();
      await expect(expirationSelect).toBeVisible();
    });
  });

  test.describe("Notification Settings", () => {
    test.skip("should display notification settings page", async ({ page }) => {
      await page.goto("/settings/notifications");

      await expect(page.getByRole("heading", { name: /notification preferences/i })).toBeVisible();
    });

    test.skip("should display notification channels", async ({ page }) => {
      await page.goto("/settings/notifications");

      await expect(page.getByText(/email/i)).toBeVisible();
      await expect(page.getByText(/push/i)).toBeVisible();
      await expect(page.getByText(/in-app/i)).toBeVisible();
    });

    test.skip("should display notification types", async ({ page }) => {
      await page.goto("/settings/notifications");

      await expect(page.getByText(/new lead/i)).toBeVisible();
      await expect(page.getByText(/lead assigned/i)).toBeVisible();
      await expect(page.getByText(/activity reminders/i)).toBeVisible();
    });

    test.skip("should toggle notification settings", async ({ page }) => {
      await page.goto("/settings/notifications");

      // Find toggle buttons for different channels
      const toggleButtons = page.locator("button").filter({ hasText: "" });
    });

    test.skip("should save notification preferences", async ({ page }) => {
      await page.goto("/settings/notifications");

      const saveButton = page.getByRole("button", { name: /save/i });
      await expect(saveButton).toBeVisible();
    });
  });
});
