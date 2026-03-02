import {
  sanitizeHtml,
  escapeHtml,
  verifyWebhookSignature,
  generateWebhookSignature,
  generateCSRFToken,
  verifyCSRFToken,
  isValidIP,
  isIPAllowed,
  hashPassword,
  verifyPassword,
  generateAPIKey,
  generateSecureToken,
  sanitizeSearchInput,
  generateCSPHeader,
  getSecurityHeaders,
  rateLimit,
} from "@/lib/utils/security";

// --- sanitizeHtml ---
describe("sanitizeHtml", () => {
  it("strips script tags", () => {
    expect(sanitizeHtml('<script>alert("xss")</script>')).toBe("");
  });

  it("keeps allowed tags", () => {
    const html = "<b>bold</b> <i>italic</i> <em>em</em> <strong>strong</strong>";
    expect(sanitizeHtml(html)).toBe(html);
  });

  it("strips disallowed tags but keeps content", () => {
    expect(sanitizeHtml("<div>hello</div>")).toBe("hello");
  });

  it("keeps allowed attributes on a tags", () => {
    const html = '<a href="https://example.com" target="_blank" rel="noopener">link</a>';
    expect(sanitizeHtml(html)).toContain('href="https://example.com"');
  });

  it("strips disallowed attributes", () => {
    const result = sanitizeHtml('<b onclick="alert(1)">text</b>');
    expect(result).not.toContain("onclick");
    expect(result).toContain("text");
  });

  it("strips event handlers from allowed tags", () => {
    const result = sanitizeHtml('<a href="#" onmouseover="alert(1)">link</a>');
    expect(result).not.toContain("onmouseover");
  });

  it("handles empty string", () => {
    expect(sanitizeHtml("")).toBe("");
  });

  it("keeps list elements", () => {
    const html = "<ul><li>item 1</li><li>item 2</li></ul>";
    expect(sanitizeHtml(html)).toBe(html);
  });
});

// --- escapeHtml ---
describe("escapeHtml", () => {
  it("escapes ampersand", () => {
    expect(escapeHtml("a & b")).toBe("a &amp; b");
  });

  it("escapes angle brackets", () => {
    expect(escapeHtml("<div>")).toBe("&lt;div&gt;");
  });

  it("escapes quotes", () => {
    expect(escapeHtml('"hello\'')).toBe("&quot;hello&#39;");
  });

  it("handles string with no special chars", () => {
    expect(escapeHtml("plain text")).toBe("plain text");
  });

  it("escapes all special chars in one string", () => {
    expect(escapeHtml('<a href="x">&')).toBe("&lt;a href=&quot;x&quot;&gt;&amp;");
  });
});

// --- Webhook Signature ---
describe("verifyWebhookSignature / generateWebhookSignature", () => {
  const payload = '{"event":"test"}';
  const secret = "my-secret-key";

  it("round-trips: generated signature verifies correctly", () => {
    const sig = generateWebhookSignature(payload, secret);
    expect(verifyWebhookSignature(payload, sig, secret)).toBe(true);
  });

  it("rejects wrong signature of same length", () => {
    const sig = generateWebhookSignature(payload, secret);
    // Flip first char to create a same-length but different signature
    const wrongSig = (sig[0] === "a" ? "b" : "a") + sig.slice(1);
    expect(verifyWebhookSignature(payload, wrongSig, secret)).toBe(false);
  });

  it("throws on different-length signature (timingSafeEqual requires same length)", () => {
    expect(() => verifyWebhookSignature(payload, "short", secret)).toThrow();
  });

  it("rejects wrong secret", () => {
    const sig = generateWebhookSignature(payload, secret);
    expect(verifyWebhookSignature(payload, sig, "wrong-secret")).toBe(false);
  });

  it("rejects tampered payload", () => {
    const sig = generateWebhookSignature(payload, secret);
    expect(verifyWebhookSignature('{"event":"tampered"}', sig, secret)).toBe(false);
  });

  it("generates hex string", () => {
    const sig = generateWebhookSignature(payload, secret);
    expect(sig).toMatch(/^[0-9a-f]{64}$/);
  });
});

// --- CSRF Token ---
describe("generateCSRFToken / verifyCSRFToken", () => {
  it("generates a 64-char hex token", () => {
    const token = generateCSRFToken();
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it("verifies matching tokens", () => {
    const token = generateCSRFToken();
    expect(verifyCSRFToken(token, token)).toBe(true);
  });

  it("rejects non-matching tokens", () => {
    const a = generateCSRFToken();
    const b = generateCSRFToken();
    expect(verifyCSRFToken(a, b)).toBe(false);
  });

  it("returns false for empty token", () => {
    expect(verifyCSRFToken("", "stored")).toBe(false);
  });

  it("returns false for empty storedToken", () => {
    expect(verifyCSRFToken("token", "")).toBe(false);
  });
});

// --- IP Validation ---
describe("isValidIP", () => {
  it("accepts valid IPv4", () => {
    expect(isValidIP("192.168.1.1")).toBe(true);
    expect(isValidIP("0.0.0.0")).toBe(true);
    expect(isValidIP("255.255.255.255")).toBe(true);
  });

  it("rejects invalid IPv4", () => {
    expect(isValidIP("256.1.1.1")).toBe(false);
    expect(isValidIP("1.2.3")).toBe(false);
    expect(isValidIP("not-an-ip")).toBe(false);
    expect(isValidIP("")).toBe(false);
  });

  it("accepts valid full IPv6", () => {
    expect(isValidIP("2001:0db8:85a3:0000:0000:8a2e:0370:7334")).toBe(true);
  });

  it("rejects invalid IPv6", () => {
    expect(isValidIP("2001:db8::1")).toBe(false); // shortened form not matched by full regex
  });
});

// --- IP Allowlist ---
describe("isIPAllowed", () => {
  it("allows any IP when allowlist is empty", () => {
    expect(isIPAllowed("1.2.3.4", [])).toBe(true);
  });

  it("allows IP in the list", () => {
    expect(isIPAllowed("1.2.3.4", ["1.2.3.4", "5.6.7.8"])).toBe(true);
  });

  it("rejects IP not in the list", () => {
    expect(isIPAllowed("9.9.9.9", ["1.2.3.4"])).toBe(false);
  });
});

// --- Password Hashing ---
describe("hashPassword / verifyPassword", () => {
  it("round-trips: hashed password verifies correctly", async () => {
    const password = "SuperSecret123!";
    const hashed = await hashPassword(password);
    expect(await verifyPassword(password, hashed)).toBe(true);
  });

  it("rejects wrong password", async () => {
    const hashed = await hashPassword("correct");
    expect(await verifyPassword("wrong", hashed)).toBe(false);
  });

  it("produces salt:hash format", async () => {
    const hashed = await hashPassword("test");
    expect(hashed).toMatch(/^[0-9a-f]+:[0-9a-f]+$/);
  });

  it("produces different hashes for same password (random salt)", async () => {
    const a = await hashPassword("same");
    const b = await hashPassword("same");
    expect(a).not.toBe(b);
  });
});

// --- API Key ---
describe("generateAPIKey", () => {
  it("starts with lf_ prefix", () => {
    expect(generateAPIKey()).toMatch(/^lf_/);
  });

  it("has 67 chars total (3 prefix + 64 hex)", () => {
    expect(generateAPIKey()).toHaveLength(67);
  });

  it("generates unique keys", () => {
    const a = generateAPIKey();
    const b = generateAPIKey();
    expect(a).not.toBe(b);
  });
});

// --- Secure Token ---
describe("generateSecureToken", () => {
  it("defaults to 64 hex chars (32 bytes)", () => {
    const token = generateSecureToken();
    expect(token).toHaveLength(64);
    expect(token).toMatch(/^[0-9a-f]+$/);
  });

  it("respects custom length", () => {
    const token = generateSecureToken(16);
    expect(token).toHaveLength(32); // 16 bytes = 32 hex chars
  });
});

// --- sanitizeSearchInput ---
describe("sanitizeSearchInput", () => {
  it("removes single quotes", () => {
    expect(sanitizeSearchInput("O'Brien")).toBe("OBrien");
  });

  it("removes double quotes", () => {
    expect(sanitizeSearchInput('say "hello"')).toBe("say hello");
  });

  it("removes semicolons and backslashes", () => {
    expect(sanitizeSearchInput("DROP;--\\")).toBe("DROP--");
  });

  it("removes backticks", () => {
    expect(sanitizeSearchInput("`admin`")).toBe("admin");
  });

  it("trims whitespace", () => {
    expect(sanitizeSearchInput("  test  ")).toBe("test");
  });

  it("returns empty for all-special input", () => {
    expect(sanitizeSearchInput("';\"\\`")).toBe("");
  });
});

// --- CSP Header ---
describe("generateCSPHeader", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env = { ...process.env, NODE_ENV: originalNodeEnv };
  });

  it("includes required directives", () => {
    const csp = generateCSPHeader();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src");
    expect(csp).toContain("style-src");
    expect(csp).toContain("img-src");
    expect(csp).toContain("connect-src");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
  });

  it("includes Stripe in script-src", () => {
    expect(generateCSPHeader()).toContain("https://js.stripe.com");
  });

  it("includes Sentry in connect-src", () => {
    expect(generateCSPHeader()).toContain("https://*.ingest.sentry.io");
  });

  it("excludes unsafe-eval in non-development (test env)", () => {
    // In test environment, NODE_ENV is "test" — not "development"
    expect(generateCSPHeader()).not.toContain("'unsafe-eval'");
  });

  it("includes upgrade-insecure-requests in non-development", () => {
    // In test environment, isDev is false so upgrade-insecure-requests is included
    expect(generateCSPHeader()).toContain("upgrade-insecure-requests");
  });
});

// --- Security Headers ---
describe("getSecurityHeaders", () => {
  it("returns all required headers", () => {
    const headers = getSecurityHeaders();
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["X-XSS-Protection"]).toBe("1; mode=block");
    expect(headers["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["Permissions-Policy"]).toContain("camera=()");
    expect(headers["Content-Security-Policy"]).toBeDefined();
  });

  it("CSP header comes from generateCSPHeader", () => {
    const headers = getSecurityHeaders();
    expect(headers["Content-Security-Policy"]).toBe(generateCSPHeader());
  });
});

// --- Rate Limiting (in-memory fallback) ---
describe("rateLimit (in-memory)", () => {
  it("allows requests under the limit", async () => {
    const result = await rateLimit("test-user-1", 5, 60000);
    expect(result.success).toBe(true);
    expect(result.remaining).toBeGreaterThanOrEqual(0);
  });

  it("blocks requests over the limit", async () => {
    const id = "test-rate-limit-block";
    for (let i = 0; i < 3; i++) {
      await rateLimit(id, 3, 60000);
    }
    const result = await rateLimit(id, 3, 60000);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("returns reset timestamp", async () => {
    const result = await rateLimit("test-reset", 10, 60000);
    expect(result.reset).toBeGreaterThan(Date.now());
  });
});
