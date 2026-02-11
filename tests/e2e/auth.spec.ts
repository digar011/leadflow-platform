import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.describe("Login Page", () => {
    test("should display login page correctly", async ({ page }) => {
      await page.goto("/login");

      // Check page title
      await expect(page).toHaveTitle(/Goldyon/);

      // Check form elements are present
      await expect(page.getByLabel("Email")).toBeVisible();
      await expect(page.getByLabel("Password")).toBeVisible();
      await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();

      // Check links
      await expect(page.getByRole("link", { name: /forgot password/i })).toBeVisible();
      await expect(page.getByRole("link", { name: /sign up/i })).toBeVisible();
    });

    test("should show validation errors for empty form", async ({ page }) => {
      await page.goto("/login");

      // Click submit without filling form
      await page.getByRole("button", { name: /sign in/i }).click();

      // Check for validation messages (HTML5 validation)
      const emailInput = page.getByLabel("Email");
      await expect(emailInput).toHaveAttribute("required", "");
    });

    test("should show validation error for invalid email", async ({ page }) => {
      await page.goto("/login");

      await page.getByLabel("Email").fill("invalid-email");
      await page.getByLabel("Password").fill("password123");
      await page.getByRole("button", { name: /sign in/i }).click();

      // Should show email validation error
      await expect(page.getByText(/please enter a valid email/i)).toBeVisible();
    });

    test("should show error for invalid credentials", async ({ page }) => {
      await page.goto("/login");

      await page.getByLabel("Email").fill("test@example.com");
      await page.getByLabel("Password").fill("wrongpassword");
      await page.getByRole("button", { name: /sign in/i }).click();

      // Should show authentication error
      await expect(page.getByRole("alert")).toBeVisible();
    });

    test("should navigate to register page", async ({ page }) => {
      await page.goto("/login");

      await page.getByRole("link", { name: /sign up/i }).click();

      await expect(page).toHaveURL(/register/, { timeout: 10000 });
    });

    test("should navigate to forgot password page", async ({ page }) => {
      await page.goto("/login");

      await page.getByRole("link", { name: /forgot password/i }).click();

      await expect(page).toHaveURL(/forgot-password/, { timeout: 10000 });
    });
  });

  test.describe("Register Page", () => {
    test("should display register page correctly", async ({ page }) => {
      await page.goto("/register");

      // Check form elements
      await expect(page.getByLabel("Full Name")).toBeVisible();
      await expect(page.getByLabel("Email")).toBeVisible();
      await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
      await expect(page.getByLabel("Confirm Password")).toBeVisible();
      await expect(page.getByRole("button", { name: /create account/i })).toBeVisible();
    });

    test("should show validation error for mismatched passwords", async ({ page }) => {
      await page.goto("/register");

      await page.getByLabel("Full Name").fill("Test User");
      await page.getByLabel("Email").fill("test@example.com");
      await page.getByLabel("Password", { exact: true }).fill("Password123");
      await page.getByLabel("Confirm Password").fill("DifferentPassword123");
      await page.getByRole("button", { name: /create account/i }).click();

      // Should show password mismatch error
      await expect(page.getByText(/don't match/i)).toBeVisible();
    });

    test("should show validation error for weak password", async ({ page }) => {
      await page.goto("/register");

      await page.getByLabel("Full Name").fill("Test User");
      await page.getByLabel("Email").fill("test@example.com");
      await page.getByLabel("Password", { exact: true }).fill("weak");
      await page.getByLabel("Confirm Password").fill("weak");
      await page.getByRole("button", { name: /create account/i }).click();

      // Should show password requirements error
      await expect(page.getByText(/password must be at least 8 characters/i)).toBeVisible();
    });

    test("should navigate to login page", async ({ page }) => {
      await page.goto("/register");

      await page.getByRole("link", { name: /sign in/i }).click();

      await expect(page).toHaveURL(/login/);
    });
  });

  test.describe("Forgot Password Page", () => {
    test("should display forgot password page correctly", async ({ page }) => {
      await page.goto("/forgot-password");

      await expect(page.getByText(/forgot your password/i)).toBeVisible();
      await expect(page.getByLabel("Email")).toBeVisible();
      await expect(page.getByRole("button", { name: /send reset/i })).toBeVisible();
    });

    test("should show validation error for invalid email", async ({ page }) => {
      await page.goto("/forgot-password");

      await page.getByLabel("Email").fill("invalid-email");
      await page.getByRole("button", { name: /send reset/i }).click();

      await expect(page.getByText(/please enter a valid email/i)).toBeVisible();
    });

    test("should navigate back to login", async ({ page }) => {
      await page.goto("/forgot-password");

      await page.getByRole("link", { name: /back to sign in/i }).click();

      await expect(page).toHaveURL(/login/);
    });
  });

  test.describe("Route Protection", () => {
    test("should redirect unauthenticated users from dashboard to login", async ({ page }) => {
      await page.goto("/dashboard");

      // Should be redirected to login
      await expect(page).toHaveURL(/login/);
    });

    test("should redirect unauthenticated users from leads to login", async ({ page }) => {
      await page.goto("/leads");

      await expect(page).toHaveURL(/login/);
    });

    test("should redirect unauthenticated users from settings to login", async ({ page }) => {
      await page.goto("/settings");

      await expect(page).toHaveURL(/login/);
    });
  });
});
