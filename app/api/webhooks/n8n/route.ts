import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// Initialize Supabase with service role for webhook processing
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Rate limiting map (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 100; // 100 requests per minute

function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now - record.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(identifier, { count: 1, timestamp: now });
    return false;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return true;
  }

  record.count++;
  return false;
}

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
    if (isRateLimited(ip)) {
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

async function processWebhookEvent(
  eventType: string,
  payload: Record<string, unknown>,
  userId: string
): Promise<{ action: string; resourceId?: string }> {
  const data = payload.data as Record<string, unknown>;

  switch (eventType) {
    case "lead.create": {
      const { data: lead, error } = await supabase
        .from("businesses")
        .insert({
          ...data,
          user_id: userId,
          source: "webhook",
        })
        .select()
        .single();

      if (error) throw error;
      return { action: "lead_created", resourceId: lead.id };
    }

    case "lead.update": {
      const leadId = data.id as string;
      if (!leadId) throw new Error("Lead ID required for update");

      const { error } = await supabase
        .from("businesses")
        .update(data)
        .eq("id", leadId)
        .eq("user_id", userId);

      if (error) throw error;
      return { action: "lead_updated", resourceId: leadId };
    }

    case "contact.create": {
      const { data: contact, error } = await supabase
        .from("contacts")
        .insert({
          ...data,
          user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;
      return { action: "contact_created", resourceId: contact.id };
    }

    case "activity.log": {
      const { data: activity, error } = await supabase
        .from("activities")
        .insert({
          ...data,
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
