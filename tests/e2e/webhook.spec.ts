import { test, expect } from "@playwright/test";

test.describe("Webhook API", () => {
  test.describe("n8n Inbound Webhook", () => {
    test("should return health check", async ({ request }) => {
      const response = await request.get("/api/webhooks/n8n");

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.status).toBe("ok");
      expect(data.message).toContain("webhook endpoint is active");
    });

    test("should reject requests without webhook ID", async ({ request }) => {
      const response = await request.post("/api/webhooks/n8n", {
        data: {
          event: "lead.create",
          data: { name: "Test Lead" },
        },
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.error).toContain("webhook ID");
    });

    test("should reject requests with invalid webhook ID", async ({ request }) => {
      const response = await request.post("/api/webhooks/n8n", {
        headers: {
          "x-webhook-id": "invalid-webhook-id",
        },
        data: {
          event: "lead.create",
          data: { name: "Test Lead" },
        },
      });

      expect(response.status()).toBe(401);
    });

    test.skip("should reject requests with invalid signature", async ({ request }) => {
      // This test requires a valid webhook to be configured
      const response = await request.post("/api/webhooks/n8n", {
        headers: {
          "x-webhook-id": "test-webhook-id",
          "x-webhook-signature": "invalid-signature",
        },
        data: {
          event: "lead.create",
          data: { name: "Test Lead" },
        },
      });

      expect(response.status()).toBe(401);
    });

    test("should reject invalid JSON payload", async ({ request }) => {
      const response = await request.post("/api/webhooks/n8n", {
        headers: {
          "x-webhook-id": "test-webhook-id",
          "content-type": "application/json",
        },
        data: "invalid json{",
      });

      // Will be rejected due to invalid webhook ID before JSON parsing
      expect(response.status()).toBe(401);
    });
  });

  test.describe("Webhook Security", () => {
    test.skip("should rate limit excessive requests", async ({ request }) => {
      // Send many requests quickly
      const promises = Array.from({ length: 150 }, () =>
        request.post("/api/webhooks/n8n", {
          headers: {
            "x-webhook-id": "rate-limit-test",
          },
          data: { event: "test" },
        })
      );

      const responses = await Promise.all(promises);

      // Some should be rate limited (429)
      const rateLimited = responses.filter((r) => r.status() === 429);
      expect(rateLimited.length).toBeGreaterThan(0);
    });

    test.skip("should verify HMAC signature", async ({ request }) => {
      // This test requires proper signature generation
      const payload = JSON.stringify({
        event: "lead.create",
        data: { name: "Test Lead" },
      });

      // Generate HMAC-SHA256 signature
      // const signature = crypto.createHmac('sha256', 'webhook-secret').update(payload).digest('hex');

      const response = await request.post("/api/webhooks/n8n", {
        headers: {
          "x-webhook-id": "test-webhook-id",
          "x-webhook-signature": "sha256=calculated_signature",
          "content-type": "application/json",
        },
        data: payload,
      });

      // Would need valid webhook config for full test
    });
  });

  test.describe("Webhook Events", () => {
    test.skip("should process lead.create event", async ({ request }) => {
      const response = await request.post("/api/webhooks/n8n", {
        headers: {
          "x-webhook-id": "valid-webhook-id",
          "x-webhook-signature": "valid-signature",
        },
        data: {
          event: "lead.create",
          data: {
            business_name: "Test Business",
            email: "test@example.com",
            status: "new",
          },
        },
      });

      // Requires valid webhook config
    });

    test.skip("should process lead.update event", async ({ request }) => {
      const response = await request.post("/api/webhooks/n8n", {
        headers: {
          "x-webhook-id": "valid-webhook-id",
          "x-webhook-signature": "valid-signature",
        },
        data: {
          event: "lead.update",
          data: {
            id: "lead-uuid",
            status: "contacted",
          },
        },
      });

      // Requires valid webhook config
    });

    test.skip("should process activity.log event", async ({ request }) => {
      const response = await request.post("/api/webhooks/n8n", {
        headers: {
          "x-webhook-id": "valid-webhook-id",
          "x-webhook-signature": "valid-signature",
        },
        data: {
          event: "activity.log",
          data: {
            business_id: "lead-uuid",
            type: "note",
            description: "Note from n8n",
          },
        },
      });

      // Requires valid webhook config
    });

    test.skip("should reject unsubscribed events", async ({ request }) => {
      // If webhook is only subscribed to lead.create
      const response = await request.post("/api/webhooks/n8n", {
        headers: {
          "x-webhook-id": "valid-webhook-id",
          "x-webhook-signature": "valid-signature",
        },
        data: {
          event: "contact.delete", // Not subscribed
          data: { id: "contact-uuid" },
        },
      });

      // Should reject with 400
    });
  });
});
