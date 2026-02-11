import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase with service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: Record<string, unknown>;
}

export interface WebhookDeliveryResult {
  webhookId: string;
  success: boolean;
  statusCode?: number;
  error?: string;
  duration: number;
}

/**
 * Send a webhook event to all subscribed outbound webhooks
 */
export async function triggerWebhooks(
  eventType: string,
  data: Record<string, unknown>,
  userId?: string
): Promise<WebhookDeliveryResult[]> {
  try {
    // Get all active outbound webhooks subscribed to this event
    let query = supabase
      .from("webhook_configs")
      .select("*")
      .eq("type", "outbound")
      .eq("is_active", true)
      .contains("events", [eventType]);

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data: webhooks, error } = await query;

    if (error) {
      console.error("Error fetching webhooks:", error);
      return [];
    }

    if (!webhooks?.length) {
      return [];
    }

    // Send to all webhooks in parallel
    const results = await Promise.all(
      webhooks.map((webhook) => deliverWebhook(webhook, eventType, data))
    );

    return results;
  } catch (error) {
    console.error("Error triggering webhooks:", error);
    return [];
  }
}

/**
 * Deliver a webhook to a single endpoint
 */
async function deliverWebhook(
  webhook: {
    id: string;
    url: string;
    secret: string | null;
    headers: Record<string, string>;
    retry_count: number;
    retry_delay: number;
  },
  eventType: string,
  data: Record<string, unknown>
): Promise<WebhookDeliveryResult> {
  const startTime = Date.now();

  const payload: WebhookPayload = {
    event: eventType,
    timestamp: new Date().toISOString(),
    data,
  };

  const payloadString = JSON.stringify(payload);

  // Generate signature if secret is configured
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Webhook-Event": eventType,
    "X-Webhook-Timestamp": payload.timestamp,
    ...(webhook.headers || {}),
  };

  if (webhook.secret) {
    const signature = crypto
      .createHmac("sha256", webhook.secret)
      .update(payloadString)
      .digest("hex");
    headers["X-Webhook-Signature"] = `sha256=${signature}`;
  }

  let lastError: string | undefined;
  let statusCode: number | undefined;

  // Retry loop with exponential backoff
  for (let attempt = 1; attempt <= webhook.retry_count; attempt++) {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    try {
      // 10-second timeout to prevent hanging on unresponsive endpoints
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(webhook.url, {
        method: "POST",
        headers,
        body: payloadString,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      statusCode = response.status;
      const duration = Date.now() - startTime;

      // Log the delivery attempt
      await logDelivery(webhook.id, eventType, payload, {
        attempt,
        status: response.ok ? "success" : "failed",
        statusCode,
        duration,
        error: response.ok ? undefined : `HTTP ${statusCode}`,
      });

      if (response.ok) {
        // Update last triggered timestamp
        await supabase
          .from("webhook_configs")
          .update({ last_triggered_at: new Date().toISOString() })
          .eq("id", webhook.id);

        return {
          webhookId: webhook.id,
          success: true,
          statusCode,
          duration,
        };
      }

      lastError = `HTTP ${statusCode}`;

      // If server error (5xx), retry; otherwise fail immediately
      if (statusCode < 500) {
        break;
      }
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error instanceof Error ? error.message : "Unknown error";
      if (error instanceof DOMException && error.name === "AbortError") {
        lastError = "Request timed out after 10s";
      }

      // Log failed attempt
      await logDelivery(webhook.id, eventType, payload, {
        attempt,
        status: attempt === webhook.retry_count ? "failed" : "retrying",
        error: lastError,
        duration: Date.now() - startTime,
      });
    }

    // Wait before retry with exponential backoff
    if (attempt < webhook.retry_count) {
      await sleep(webhook.retry_delay * Math.pow(2, attempt - 1));
    }
  }

  return {
    webhookId: webhook.id,
    success: false,
    statusCode,
    error: lastError,
    duration: Date.now() - startTime,
  };
}

/**
 * Log a webhook delivery attempt
 */
async function logDelivery(
  webhookId: string,
  eventType: string,
  payload: WebhookPayload,
  result: {
    attempt: number;
    status: string;
    statusCode?: number;
    error?: string;
    duration: number;
  }
) {
  try {
    await supabase.from("webhook_deliveries").insert({
      webhook_id: webhookId,
      event_type: eventType,
      payload,
      response_status: result.statusCode,
      attempt_number: result.attempt,
      status: result.status,
      error_message: result.error,
      duration_ms: result.duration,
    });
  } catch (error) {
    console.error("Error logging webhook delivery:", error);
  }
}

/**
 * Helper to sleep for a given duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Export event trigger helpers for common events
export const webhookEvents = {
  leadCreated: (lead: Record<string, unknown>, userId?: string) =>
    triggerWebhooks("lead.created", lead, userId),

  leadUpdated: (lead: Record<string, unknown>, userId?: string) =>
    triggerWebhooks("lead.updated", lead, userId),

  leadDeleted: (leadId: string, userId?: string) =>
    triggerWebhooks("lead.deleted", { id: leadId }, userId),

  leadStatusChanged: (
    lead: Record<string, unknown>,
    oldStatus: string,
    newStatus: string,
    userId?: string
  ) =>
    triggerWebhooks(
      "lead.status_changed",
      { lead, oldStatus, newStatus },
      userId
    ),

  leadConverted: (lead: Record<string, unknown>, userId?: string) =>
    triggerWebhooks("lead.converted", lead, userId),

  contactCreated: (contact: Record<string, unknown>, userId?: string) =>
    triggerWebhooks("contact.created", contact, userId),

  contactUpdated: (contact: Record<string, unknown>, userId?: string) =>
    triggerWebhooks("contact.updated", contact, userId),

  activityLogged: (activity: Record<string, unknown>, userId?: string) =>
    triggerWebhooks("activity.logged", activity, userId),

  campaignStarted: (campaign: Record<string, unknown>, userId?: string) =>
    triggerWebhooks("campaign.started", campaign, userId),

  campaignCompleted: (campaign: Record<string, unknown>, userId?: string) =>
    triggerWebhooks("campaign.completed", campaign, userId),

  automationTriggered: (
    rule: Record<string, unknown>,
    result: Record<string, unknown>,
    userId?: string
  ) => triggerWebhooks("automation.triggered", { rule, result }, userId),
};
