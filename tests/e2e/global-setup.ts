import { test as setup } from "@playwright/test";

setup("global setup", async ({ page }) => {
  // This file runs before all tests
  // You can add global setup logic here, such as:
  // - Seeding test database
  // - Setting up test users
  // - Configuring environment

  console.log("Running global test setup...");

  // Verify the app is running
  const response = await page.goto("/");
  if (!response || response.status() >= 400) {
    throw new Error("Application is not running or returned an error");
  }

  console.log("Global setup complete.");
});
