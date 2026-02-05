import { test, expect } from "@playwright/test";

test.describe("Contacts Management", () => {
  test.describe("Contacts List Page", () => {
    test("should redirect to login for unauthenticated users", async ({ page }) => {
      await page.goto("/contacts");

      await expect(page).toHaveURL(/login/);
    });

    test.describe("Authenticated", () => {
      test.skip("should display contacts page correctly", async ({ page }) => {
        await page.goto("/contacts");

        await expect(page.getByRole("heading", { name: /contacts/i })).toBeVisible();
        await expect(page.getByPlaceholder(/search contacts/i)).toBeVisible();
      });

      test.skip("should filter contacts by search", async ({ page }) => {
        await page.goto("/contacts");

        await page.getByPlaceholder(/search contacts/i).fill("John");

        // Should filter the list (implementation depends on actual data)
        await expect(page.getByPlaceholder(/search contacts/i)).toHaveValue("John");
      });

      test.skip("should display contact cards with correct information", async ({ page }) => {
        await page.goto("/contacts");

        // Contact cards should show name, email, phone
        // This test would need actual data to verify
      });

      test.skip("should navigate to lead when clicking view lead", async ({ page }) => {
        await page.goto("/contacts");

        // Click view lead link on a contact
        const viewLeadLink = page.getByRole("link", { name: /view lead/i }).first();
        await viewLeadLink.click();

        await expect(page).toHaveURL(/leads\//);
      });
    });
  });

  test.describe("Add Contact Page", () => {
    test("should redirect to login for unauthenticated users", async ({ page }) => {
      await page.goto("/leads/test-id/contacts/new");

      await expect(page).toHaveURL(/login/);
    });

    test.describe("Authenticated", () => {
      test.skip("should display add contact form", async ({ page }) => {
        await page.goto("/leads/test-id/contacts/new");

        await expect(page.getByRole("heading", { name: /add contact/i })).toBeVisible();

        // Personal information
        await expect(page.getByLabel(/first name/i)).toBeVisible();
        await expect(page.getByLabel(/last name/i)).toBeVisible();
        await expect(page.getByLabel(/email/i)).toBeVisible();
        await expect(page.getByLabel(/phone/i)).toBeVisible();

        // Job information
        await expect(page.getByLabel(/job title/i)).toBeVisible();
        await expect(page.getByLabel(/department/i)).toBeVisible();

        // Primary contact checkbox
        await expect(page.getByLabel(/primary contact/i)).toBeVisible();

        // Actions
        await expect(page.getByRole("button", { name: /add contact/i })).toBeVisible();
        await expect(page.getByRole("button", { name: /cancel/i })).toBeVisible();
      });

      test.skip("should show validation error for missing first name", async ({ page }) => {
        await page.goto("/leads/test-id/contacts/new");

        await page.getByLabel(/last name/i).fill("Doe");
        await page.getByRole("button", { name: /add contact/i }).click();

        await expect(page.getByText(/first name is required/i)).toBeVisible();
      });

      test.skip("should show validation error for missing last name", async ({ page }) => {
        await page.goto("/leads/test-id/contacts/new");

        await page.getByLabel(/first name/i).fill("John");
        await page.getByRole("button", { name: /add contact/i }).click();

        await expect(page.getByText(/last name is required/i)).toBeVisible();
      });

      test.skip("should show validation error for invalid email", async ({ page }) => {
        await page.goto("/leads/test-id/contacts/new");

        await page.getByLabel(/first name/i).fill("John");
        await page.getByLabel(/last name/i).fill("Doe");
        await page.getByLabel(/email/i).fill("invalid-email");
        await page.getByRole("button", { name: /add contact/i }).click();

        await expect(page.getByText(/valid email/i)).toBeVisible();
      });

      test.skip("should navigate back when cancel is clicked", async ({ page }) => {
        await page.goto("/leads/test-id/contacts/new");

        await page.getByRole("button", { name: /cancel/i }).click();

        await expect(page).toHaveURL(/leads\/test-id/);
      });
    });
  });

  test.describe("Edit Contact Page", () => {
    test("should redirect to login for unauthenticated users", async ({ page }) => {
      await page.goto("/leads/test-id/contacts/contact-id/edit");

      await expect(page).toHaveURL(/login/);
    });

    test.describe("Authenticated", () => {
      test.skip("should display edit contact form with pre-filled data", async ({ page }) => {
        await page.goto("/leads/test-id/contacts/contact-id/edit");

        await expect(page.getByRole("heading", { name: /edit contact/i })).toBeVisible();

        // Form should have values pre-filled
        await expect(page.getByLabel(/first name/i)).not.toHaveValue("");
      });

      test.skip("should update contact successfully", async ({ page }) => {
        await page.goto("/leads/test-id/contacts/contact-id/edit");

        await page.getByLabel(/first name/i).fill("Updated Name");
        await page.getByRole("button", { name: /save changes/i }).click();

        // Should redirect back to lead detail
        await expect(page).toHaveURL(/leads\/test-id/);
      });
    });
  });
});
