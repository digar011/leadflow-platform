import { test, expect } from "@playwright/test";

test.describe("Mobile Responsive Layout", () => {
  test.describe("Mobile Viewport - Login Page", () => {
    test.use({
      viewport: { width: 375, height: 812 },
      storageState: { cookies: [], origins: [] },
    });

    test("should render login page correctly at mobile size", async ({ page }) => {
      await page.goto("/login");

      // Check the login page renders correctly at mobile size
      await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
    });
  });

  test.describe("Mobile Viewport - Authenticated (<768px)", () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test("should hide sidebar by default at mobile viewport", async ({ page }) => {
      await page.goto("/dashboard");

      // The sidebar has the class max-md:-translate-x-full which hides it off-screen
      const sidebar = page.locator("aside");
      await expect(sidebar).toHaveClass(/max-md:-translate-x-full/);

      // Sidebar should be visually off-screen (translated away)
      const sidebarBox = await sidebar.boundingBox();
      // When translated off-screen, the sidebar's x position should be negative
      if (sidebarBox) {
        expect(sidebarBox.x).toBeLessThan(0);
      }

      // Hamburger button should be visible (it has md:hidden class, visible on mobile)
      const hamburgerButton = page.locator("button.md\\:hidden, button:has(svg)").filter({
        has: page.locator("svg"),
      });
      // The hamburger is in the header with md:hidden class
      const headerHamburger = page.locator("header button").first();
      await expect(headerHamburger).toBeVisible();
    });

    test("should open sidebar overlay with backdrop when hamburger is clicked", async ({ page }) => {
      await page.goto("/dashboard");

      // Click the hamburger button in the header
      const hamburgerButton = page.locator("header button").first();
      await hamburgerButton.click();

      // The sidebar should now be visible (translate-x-0 applied via isMobileOpen)
      const sidebar = page.locator("aside");
      await expect(sidebar).toHaveClass(/max-md:translate-x-0/);

      // A backdrop overlay should appear (div with bg-black/60 and md:hidden)
      const backdrop = page.locator("div.fixed.inset-0");
      await expect(backdrop).toBeVisible();
    });

    test("should close sidebar when a nav link is clicked", async ({ page }) => {
      await page.goto("/dashboard");

      // Open the sidebar
      const hamburgerButton = page.locator("header button").first();
      await hamburgerButton.click();

      // Sidebar should be open
      const sidebar = page.locator("aside");
      await expect(sidebar).toHaveClass(/max-md:translate-x-0/);

      // Click a navigation link (e.g., Leads)
      const leadsLink = sidebar.getByRole("link", { name: "Leads" });
      await leadsLink.click();

      // Wait for navigation
      await page.waitForURL(/\/leads/);

      // After clicking a nav link, the sidebar auto-closes via the useEffect
      // that calls onMobileClose when pathname changes
      // The sidebar should go back to hidden state
      await expect(sidebar).not.toHaveClass(/max-md:translate-x-0/);
    });
  });

  test.describe("Desktop Viewport (>=768px)", () => {
    test.use({ viewport: { width: 1280, height: 720 } });

    test("should always show sidebar and hide hamburger at desktop viewport", async ({ page }) => {
      await page.goto("/dashboard");

      // The sidebar should be visible on desktop
      const sidebar = page.locator("aside");
      await expect(sidebar).toBeVisible();

      // At desktop (>= md breakpoint), the max-md:-translate-x-full has no effect
      // The sidebar should be on-screen
      const sidebarBox = await sidebar.boundingBox();
      expect(sidebarBox).not.toBeNull();
      if (sidebarBox) {
        expect(sidebarBox.x).toBeGreaterThanOrEqual(0);
      }

      // Hamburger button should NOT be visible on desktop (md:hidden hides it)
      // The hamburger is rendered with className containing md:hidden
      const hamburgerButton = page.locator("header button.md\\:hidden");
      // md:hidden means display:none at >=768px, so count could be 0 or it exists but is hidden
      if (await hamburgerButton.count() > 0) {
        await expect(hamburgerButton).not.toBeVisible();
      }

      // Verify sidebar navigation links are visible
      await expect(sidebar.getByRole("link", { name: "Dashboard" })).toBeVisible();
      await expect(sidebar.getByRole("link", { name: "Leads" })).toBeVisible();
      await expect(sidebar.getByRole("link", { name: "Contacts" })).toBeVisible();
    });
  });
});
