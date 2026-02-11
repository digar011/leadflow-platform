import { test as setup, expect } from "@playwright/test";

const SUPABASE_URL = "https://kitimzmjjuvznfiyjiuw.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpdGltem1qanV2em5maXlqaXV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMDIxNDksImV4cCI6MjA4NDg3ODE0OX0.IJ3XCq7QHEHvPqm2HYXsW6N0RxF0Rbl7uSPZdpaMkJk";

const authFile = "tests/e2e/.auth/user.json";

setup("authenticate", async ({ page }) => {
  // Sign in via the login page UI (lets Supabase SSR set cookies properly)
  await page.goto("/login");

  await page.getByLabel("Email").fill("admin123@test.com");
  await page.getByLabel("Password").fill("Test123!");
  await page.getByRole("button", { name: /sign in/i }).click();

  // Wait for redirect to dashboard after successful login
  await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });

  // Save the authenticated state (cookies + localStorage)
  await page.context().storageState({ path: authFile });
});
