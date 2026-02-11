import { test, expect } from "@playwright/test";

test.describe("Leads Management", () => {
  test.describe("Leads List Page", () => {
    test.describe("Unauthenticated", () => {
      test.use({ storageState: { cookies: [], origins: [] } });

      test("should redirect to login for unauthenticated users", async ({ page }) => {
        await page.goto("/leads");
        await expect(page).toHaveURL(/login/);
      });
    });

    test.describe("Authenticated", () => {
      test("should display page header and actions", async ({ page }) => {
        await page.goto("/leads");

        await expect(page.getByRole("heading", { name: /leads/i })).toBeVisible();
        await expect(page.getByRole("link", { name: /add lead/i })).toBeVisible();
        await expect(page.getByRole("button", { name: /export/i })).toBeVisible();
      });

      test("should display stats cards", async ({ page }) => {
        await page.goto("/leads");

        await expect(page.getByText(/total leads/i)).toBeVisible();
        await expect(page.getByText(/new this week/i)).toBeVisible();
        await expect(page.getByText(/pipeline value/i)).toBeVisible();
        await expect(page.getByText(/won deals/i)).toBeVisible();
      });

      test("should display filter controls", async ({ page }) => {
        await page.goto("/leads");

        // Search input
        await expect(page.getByPlaceholder(/search/i)).toBeVisible();

        // Filter dropdowns
        await expect(page.getByRole("combobox", { name: /status/i })).toBeVisible();
        await expect(page.getByRole("combobox", { name: /temperature/i })).toBeVisible();
        await expect(page.getByRole("combobox", { name: /source/i })).toBeVisible();
      });

      test("should display leads table with columns", async ({ page }) => {
        await page.goto("/leads");

        // Table headers
        await expect(page.getByRole("columnheader", { name: /business/i })).toBeVisible();
        await expect(page.getByRole("columnheader", { name: /status/i })).toBeVisible();
        await expect(page.getByRole("columnheader", { name: /contact/i })).toBeVisible();
      });

      test("should navigate to kanban view", async ({ page }) => {
        await page.goto("/leads");

        await page.getByRole("link", { name: /kanban/i }).click();

        await expect(page).toHaveURL(/leads\/kanban/);
      });

      test("should navigate to add lead page", async ({ page }) => {
        await page.goto("/leads");

        await page.getByRole("link", { name: /add lead/i }).click();

        await expect(page).toHaveURL(/leads\/new/);
      });
    });
  });

  test.describe("Add Lead Page", () => {
    test.describe("Unauthenticated", () => {
      test.use({ storageState: { cookies: [], origins: [] } });

      test("should redirect to login for unauthenticated users", async ({ page }) => {
        await page.goto("/leads/new");
        await expect(page).toHaveURL(/login/);
      });
    });

    test.describe("Authenticated", () => {
      test("should display add lead form", async ({ page }) => {
        await page.goto("/leads/new");

        await expect(page.getByRole("heading", { name: /add new lead/i })).toBeVisible();

        // Basic information
        await expect(page.getByLabel(/business name/i)).toBeVisible();
        await expect(page.getByLabel(/email/i)).toBeVisible();
        await expect(page.getByLabel(/phone/i)).toBeVisible();
        await expect(page.getByLabel(/website/i)).toBeVisible();

        // Address
        await expect(page.getByLabel(/street address/i)).toBeVisible();
        await expect(page.getByLabel(/city/i)).toBeVisible();
        await expect(page.getByLabel(/state/i)).toBeVisible();

        // Lead details
        await expect(page.getByLabel(/status/i)).toBeVisible();
        await expect(page.getByLabel(/temperature/i)).toBeVisible();
        await expect(page.getByLabel(/source/i)).toBeVisible();

        // Actions
        await expect(page.getByRole("button", { name: /create lead/i })).toBeVisible();
        await expect(page.getByRole("button", { name: /cancel/i })).toBeVisible();
      });

      test("should show validation error for missing business name", async ({ page }) => {
        await page.goto("/leads/new");

        await page.getByRole("button", { name: /create lead/i }).click();

        await expect(page.getByText(/business name is required/i)).toBeVisible();
      });

      test("should show validation error for invalid email", async ({ page }) => {
        await page.goto("/leads/new");

        await page.getByLabel(/business name/i).fill("Test Business");
        await page.getByLabel(/email/i).fill("invalid-email");
        await page.getByRole("button", { name: /create lead/i }).click();

        await expect(page.getByText(/valid email/i)).toBeVisible();
      });

      test("should navigate back when cancel is clicked", async ({ page }) => {
        await page.goto("/leads/new");

        await page.getByRole("button", { name: /cancel/i }).click();

        await expect(page).toHaveURL(/leads/);
      });
    });
  });

  test.describe("Lead Detail Page", () => {
    test.describe("Unauthenticated", () => {
      test.use({ storageState: { cookies: [], origins: [] } });

      test("should redirect to login for unauthenticated users", async ({ page }) => {
        await page.goto("/leads/test-id");
        await expect(page).toHaveURL(/login/);
      });
    });

    test.describe("Authenticated", () => {
      test("should display 360-degree customer view", async ({ page }) => {
        await page.goto("/leads/test-id");

        // Header with business name and status
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

        // Quick actions
        await expect(page.getByRole("button", { name: /log call/i })).toBeVisible();
        await expect(page.getByRole("button", { name: /log email/i })).toBeVisible();

        // Business details card
        await expect(page.getByText(/business details/i)).toBeVisible();

        // Tabs for different sections
        await expect(page.getByRole("tab", { name: /timeline/i })).toBeVisible();
        await expect(page.getByRole("tab", { name: /contacts/i })).toBeVisible();
        await expect(page.getByRole("tab", { name: /documents/i })).toBeVisible();

        // Engagement score
        await expect(page.getByText(/engagement/i)).toBeVisible();

        // Key dates
        await expect(page.getByText(/key dates/i)).toBeVisible();
      });

      test("should display journey timeline", async ({ page }) => {
        await page.goto("/leads/test-id");

        // Timeline tab should be active by default
        await expect(page.getByText(/customer journey/i)).toBeVisible();
      });

      test("should switch to contacts tab", async ({ page }) => {
        await page.goto("/leads/test-id");

        await page.getByRole("tab", { name: /contacts/i }).click();

        await expect(page.getByRole("button", { name: /add contact/i })).toBeVisible();
      });

      test("should open quick action modal", async ({ page }) => {
        await page.goto("/leads/test-id");

        await page.getByRole("button", { name: /log call/i }).click();

        await expect(page.getByRole("dialog")).toBeVisible();
        await expect(page.getByLabel(/subject/i)).toBeVisible();
      });

      test("should navigate to edit page", async ({ page }) => {
        await page.goto("/leads/test-id");

        await page.getByRole("link", { name: /edit/i }).click();

        await expect(page).toHaveURL(/leads\/test-id\/edit/);
      });

      test("should show delete confirmation modal", async ({ page }) => {
        await page.goto("/leads/test-id");

        await page.getByRole("button", { name: /delete/i }).click();

        await expect(page.getByRole("dialog")).toBeVisible();
        await expect(page.getByText(/are you sure/i)).toBeVisible();
        await expect(page.getByRole("button", { name: /delete lead/i })).toBeVisible();
      });
    });
  });

  test.describe("Kanban Board", () => {
    test.describe("Unauthenticated", () => {
      test.use({ storageState: { cookies: [], origins: [] } });

      test("should redirect to login for unauthenticated users", async ({ page }) => {
        await page.goto("/leads/kanban");
        await expect(page).toHaveURL(/login/);
      });
    });

    test.describe("Authenticated", () => {
      test("should display kanban board with columns", async ({ page }) => {
        await page.goto("/leads/kanban");

        await expect(page.getByRole("heading", { name: /pipeline/i })).toBeVisible();

        // Status columns
        await expect(page.getByText(/new/i)).toBeVisible();
        await expect(page.getByText(/contacted/i)).toBeVisible();
        await expect(page.getByText(/qualified/i)).toBeVisible();
        await expect(page.getByText(/proposal/i)).toBeVisible();
        await expect(page.getByText(/negotiation/i)).toBeVisible();
        await expect(page.getByText(/won/i)).toBeVisible();
      });

      test("should display stats summary", async ({ page }) => {
        await page.goto("/leads/kanban");

        await expect(page.getByText(/total in pipeline/i)).toBeVisible();
        await expect(page.getByText(/pipeline value/i)).toBeVisible();
      });

      test("should navigate to list view", async ({ page }) => {
        await page.goto("/leads/kanban");

        await page.getByRole("link", { name: /list view/i }).click();

        await expect(page).toHaveURL("/leads");
      });

      test("should navigate to add lead page", async ({ page }) => {
        await page.goto("/leads/kanban");

        await page.getByRole("link", { name: /add lead/i }).click();

        await expect(page).toHaveURL(/leads\/new/);
      });
    });
  });
});
