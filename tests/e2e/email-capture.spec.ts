import { test, expect } from "@playwright/test";

test.describe("Email Capture Settings", () => {
  test("email capture section is visible on webhooks settings page", async ({ page }) => {
    await page.goto("/settings/webhooks");
    await expect(page.getByText("Email Capture")).toBeVisible({ timeout: 10000 });
  });

  test("shows forwarding address with copy button", async ({ page }) => {
    await page.goto("/settings/webhooks");
    await expect(page.getByText("Email Capture")).toBeVisible({ timeout: 10000 });

    // Forwarding address should contain "crm-" and "@inbound.goldyon.app"
    const addressContainer = page.locator(".font-mono");
    await expect(addressContainer).toBeVisible({ timeout: 5000 });

    // Copy button should be present
    const copyButton = page.getByRole("button").filter({ has: page.locator("svg") }).nth(0);
    await expect(copyButton).toBeVisible();
  });

  test("shows how it works steps", async ({ page }) => {
    await page.goto("/settings/webhooks");
    await expect(page.getByText("How it works")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Add this address as BCC")).toBeVisible();
    await expect(page.getByText("automatically matched")).toBeVisible();
    await expect(page.getByText("activity timeline")).toBeVisible();
  });

  test("setup guides are collapsible", async ({ page }) => {
    await page.goto("/settings/webhooks");
    await expect(page.getByText("Email Capture")).toBeVisible({ timeout: 10000 });

    // Gmail guide should be collapsed initially
    const gmailButton = page.getByText("Gmail Setup");
    await expect(gmailButton).toBeVisible();

    // Gmail instructions should be hidden
    await expect(page.getByText("Open Gmail")).not.toBeVisible();

    // Click to expand
    await gmailButton.click();
    await expect(page.getByText("Open Gmail")).toBeVisible();

    // Outlook guide
    const outlookButton = page.getByText("Outlook Setup");
    await expect(outlookButton).toBeVisible();
    await outlookButton.click();
    await expect(page.getByText("In Outlook")).toBeVisible();
  });
});
