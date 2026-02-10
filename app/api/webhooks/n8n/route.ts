import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// Initialize Supabase with service role for webhook processing
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

import { rateLimit } from "@/lib/utils/security";

function verifySignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  const signatureWithPrefix = signature.startsWith("sha256=")
    ? signature.slice(7)
    : signature;

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signatureWithPrefix)
  );
}

export async function POST(request: NextRequest) {
  try {
    // Get IP for rate limiting
    const ip = request.headers.get("x-forwarded-for") || "unknown";

    // Rate limiting check
    if (!(await rateLimit(`n8n:${ip}`, 100, 60000)).success) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    // Get webhook secret from header (identifies the webhook config)
    const webhookId = request.headers.get("x-webhook-id");
    const signature = request.headers.get("x-webhook-signature");

    if (!webhookId) {
      return NextResponse.json(
        { error: "Missing webhook ID" },
        { status: 400 }
      );
    }

    // Get webhook config
    const { data: webhook, error: webhookError } = await supabase
      .from("webhook_configs")
      .select("*")
      .eq("id", webhookId)
      .eq("type", "inbound")
      .eq("is_active", true)
      .single();

    if (webhookError || !webhook) {
      return NextResponse.json(
        { error: "Invalid or inactive webhook" },
        { status: 401 }
      );
    }

    // IP allowlist check
    if (webhook.ip_allowlist?.length > 0) {
      if (!webhook.ip_allowlist.includes(ip)) {
        return NextResponse.json(
          { error: "IP not allowed" },
          { status: 403 }
        );
      }
    }

    // Get raw body for signature verification
    const rawBody = await request.text();

    // Verify signature
    if (webhook.secret) {
      if (!verifySignature(rawBody, signature, webhook.secret)) {
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    // Parse payload
    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    // Validate event type
    const eventType = payload.event || payload.type;
    if (!eventType) {
      return NextResponse.json(
        { error: "Missing event type" },
        { status: 400 }
      );
    }

    // Check if webhook is subscribed to this event
    if (webhook.events?.length > 0 && !webhook.events.includes(eventType)) {
      return NextResponse.json(
        { error: "Webhook not subscribed to this event" },
        { status: 400 }
      );
    }

    // Process the event
    const result = await processWebhookEvent(eventType, payload, webhook.user_id);

    // Update last triggered timestamp
    await supabase
      .from("webhook_configs")
      .update({ last_triggered_at: new Date().toISOString() })
      .eq("id", webhookId);

    // Log the delivery
    await supabase.from("webhook_deliveries").insert({
      webhook_id: webhookId,
      event_type: eventType,
      payload,
      response_status: 200,
      status: "success",
      duration_ms: 0,
    });

    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
      result,
    });
  } catch (error) {
    console.error("Webhook processing error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Allowlisted fields per resource type to prevent arbitrary column injection
const ALLOWED_LEAD_FIELDS = [
  "business_name", "email", "phone", "website", "industry",
  "street_address", "city", "state", "zip_code", "country",
  "status", "temperature", "source", "deal_value", "description",
  "expected_close_date", "next_follow_up", "tags",
] as const;

const ALLOWED_CONTACT_FIELDS = [
  "first_name", "last_name", "email", "phone", "title",
  "department", "linkedin_url", "is_primary", "business_id",
] as const;

const ALLOWED_ACTIVITY_FIELDS = [
  "activity_type", "subject", "description", "outcome",
  "scheduled_at", "business_id", "contact_id", "metadata",
] as const;

function pickAllowedFields(
  data: Record<string, unknown>,
  allowed: readonly string[]
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in data && data[key] !== undefined) {
      result[key] = data[key];
    }
  }
  return result;
}

async function processWebhookEvent(
  eventType: string,
  payload: Record<string, unknown>,
  userId: string
): Promise<{ action: string; resourceId?: string }> {
  const rawData = (payload.data || {}) as Record<string, unknown>;

  switch (eventType) {
    case "lead.create": {
      const safeData = pickAllowedFields(rawData, ALLOWED_LEAD_FIELDS);
      if (!safeData.business_name) {
        throw new Error("business_name is required for lead creation");
      }
      const { data: lead, error } = await supabase
        .from("businesses")
        .insert({
          ...safeData,
          user_id: userId,
          source: "webhook",
        })
        .select()
        .single();

      if (error) throw error;
      return { action: "lead_created", resourceId: lead.id };
    }

    case "lead.update": {
      const leadId = rawData.id as string;
      if (!leadId) throw new Error("Lead ID required for update");

      const safeData = pickAllowedFields(rawData, ALLOWED_LEAD_FIELDS);
      const { error } = await supabase
        .from("businesses")
        .update(safeData)
        .eq("id", leadId)
        .eq("user_id", userId);

      if (error) throw error;
      return { action: "lead_updated", resourceId: leadId };
    }

    case "contact.create": {
      const safeData = pickAllowedFields(rawData, ALLOWED_CONTACT_FIELDS);
      if (!safeData.first_name || !safeData.last_name) {
        throw new Error("first_name and last_name are required for contact creation");
      }
      const { data: contact, error } = await supabase
        .from("contacts")
        .insert({
          ...safeData,
          user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;
      return { action: "contact_created", resourceId: contact.id };
    }

    case "activity.log": {
      const safeData = pickAllowedFields(rawData, ALLOWED_ACTIVITY_FIELDS);
      if (!safeData.activity_type) {
        throw new Error("activity_type is required for activity logging");
      }
      const { data: activity, error } = await supabase
        .from("activities")
        .insert({
          ...safeData,
          user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;
      return { action: "activity_logged", resourceId: activity.id };
    }

    default:
      return { action: "event_received" };
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "n8n webhook endpoint is active",
    timestamp: new Date().toISOString(),
  });
}
