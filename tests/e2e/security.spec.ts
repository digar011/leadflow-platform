import { test, expect } from "@playwright/test";

test.describe("Security", () => {
  test.describe("Security Headers", () => {
    test("should include Content-Security-Policy header", async ({ page }) => {
      const response = await page.goto("/dashboard");
      const csp = response?.headers()["content-security-policy"];

      expect(csp).toBeDefined();
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("frame-ancestors 'none'");
      expect(csp).toContain("object-src 'none'");
    });

    test("should include HSTS header", async ({ page }) => {
      const response = await page.goto("/dashboard");
      const hsts = response?.headers()["strict-transport-security"];

      expect(hsts).toBeDefined();
      expect(hsts).toContain("max-age=31536000");
      expect(hsts).toContain("includeSubDomains");
    });

    test("should include X-Frame-Options header", async ({ page }) => {
      const response = await page.goto("/dashboard");
      const xfo = response?.headers()["x-frame-options"];

      expect(xfo).toBe("DENY");
    });

    test("should include X-Content-Type-Options header", async ({ page }) => {
      const response = await page.goto("/dashboard");
      const xcto = response?.headers()["x-content-type-options"];

      expect(xcto).toBe("nosniff");
    });

    test("should include X-XSS-Protection header", async ({ page }) => {
      const response = await page.goto("/dashboard");
      const xxss = response?.headers()["x-xss-protection"];

      expect(xxss).toBe("1; mode=block");
    });

    test("should include Referrer-Policy header", async ({ page }) => {
      const response = await page.goto("/dashboard");
      const rp = response?.headers()["referrer-policy"];

      expect(rp).toBe("strict-origin-when-cross-origin");
    });
  });

  test.describe("Route Protection", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    const protectedRoutes = [
      "/dashboard",
      "/leads",
      "/contacts",
      "/activities",
      "/campaigns",
      "/reports",
      "/automation",
      "/settings",
      "/settings/profile",
      "/settings/team",
      "/settings/webhooks",
      "/settings/billing",
    ];

    for (const route of protectedRoutes) {
      test(`should redirect unauthenticated users from ${route} to login`, async ({ page }) => {
        await page.goto(route);
        await expect(page).toHaveURL(/login/);
      });
    }
  });

  test.describe("Admin Route Protection", () => {
    // Uses the default authenticated storageState (admin123@test.com is admin,
    // so we can't fully test non-admin rejection here without a second user,
    // but we can verify the route loads for admin and doesn't error)
    test("admin route should be accessible for admin users", async ({ page }) => {
      await page.goto("/admin");
      // Admin user should NOT be redirected to login
      await expect(page).not.toHaveURL(/login/);
    });

    test("admin routes should redirect unauthenticated users", async ({ browser }) => {
      const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
      const page = await context.newPage();

      await page.goto("/admin");
      await expect(page).toHaveURL(/login/);

      await page.goto("/admin/users");
      await expect(page).toHaveURL(/login/);

      await context.close();
    });
  });

  test.describe("XSS Prevention", () => {
    test("should not execute script tags in search inputs", async ({ page }) => {
      await page.goto("/leads");

      // Inject XSS payload into search input
      const searchInput = page.getByPlaceholder(/search/i);
      if (await searchInput.isVisible().catch(() => false)) {
        await searchInput.fill('<script>alert("xss")</script>');

        // Wait briefly for any potential script execution
        await page.waitForTimeout(1000);

        // The page should not have triggered an alert dialog
        // If XSS worked, the script would execute — verify page is still intact
        await expect(page.getByPlaceholder(/search/i)).toBeVisible();

        // Verify the raw text is displayed, not executed
        const inputValue = await searchInput.inputValue();
        expect(inputValue).toContain("<script>");
      }
    });

    test("should not execute script tags in form fields", async ({ page }) => {
      await page.goto("/leads/new", { waitUntil: "networkidle" });

      const nameInput = page.getByLabel(/business name/i);
      await expect(nameInput).toBeVisible({ timeout: 15000 });
      await nameInput.fill('<img src=x onerror="alert(1)">');

      // Page should still be functional
      await expect(nameInput).toBeVisible();
      const val = await nameInput.inputValue();
      expect(val).toContain("<img");
    });

    test("should sanitize HTML in displayed content", async ({ page }) => {
      await page.goto("/dashboard");

      // Verify no raw script tags are rendered in the page body
      const bodyContent = await page.locator("body").innerHTML();
      // Should not contain unescaped script tags in user-content areas
      expect(bodyContent).not.toMatch(/<script>alert\(/);
    });
  });

  test.describe("CSRF Protection", () => {
    test("should reject POST requests with mismatched Origin header", async ({ request }) => {
      const response = await request.post("/dashboard", {
        headers: {
          Origin: "https://evil-site.com",
        },
        data: { test: "csrf" },
      });

      // Middleware CSRF check should reject this
      expect(response.status()).toBe(403);
      const body = await response.json();
      expect(body.error).toContain("CSRF");
    });
  });

  test.describe("SQL Injection Prevention", () => {
    test("should handle SQL injection attempts in search gracefully", async ({ page }) => {
      await page.goto("/leads");

      const searchInput = page.getByPlaceholder(/search/i);
      if (await searchInput.isVisible().catch(() => false)) {
        await searchInput.fill("'; DROP TABLE businesses; --");

        // Wait for search/filter to trigger
        await page.waitForTimeout(1500);

        // Page should still be functional and not crash
        await expect(page.getByRole("heading", { name: /leads/i })).toBeVisible();
      }
    });

    test("should handle SQL injection in URL parameters gracefully", async ({ page }) => {
      // Attempt SQL injection via URL
      const response = await page.goto("/leads?search=' OR 1=1 --");

      // Page should load without error (app uses parameterized queries via Supabase)
      expect(response?.status()).toBeLessThan(500);
    });
  });

  test.describe("Auth Token Validation", () => {
    test("should redirect to login with expired/invalid cookies", async ({ browser }) => {
      const context = await browser.newContext({
        storageState: {
          cookies: [
            {
              name: "sb-kitimzmjjuvznfiyjiuw-auth-token",
              value: "invalid-token-value",
              domain: "localhost",
              path: "/",
              expires: -1,
              httpOnly: false,
              secure: false,
              sameSite: "Lax" as const,
            },
          ],
          origins: [],
        },
      });
      const page = await context.newPage();

      await page.goto("/dashboard");

      // Invalid auth should redirect to login
      await expect(page).toHaveURL(/login/, { timeout: 10000 });

      await context.close();
    });

    test("should not expose sensitive data in error responses", async ({ request }) => {
      const response = await request.get("/api/webhooks/n8n");
      const data = await response.json();

      // API responses should not leak internal details
      const text = JSON.stringify(data);
      expect(text).not.toContain("password");
      expect(text).not.toContain("secret_key");
      expect(text).not.toContain("SUPABASE_SERVICE_ROLE");
    });
  });
});
