import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

import type { Database } from "@/lib/types/database";
import { rateLimit } from "@/lib/utils/security";
import { ApiErrors, handleApiError } from "@/lib/utils/api-errors";

// Lazy-initialized Supabase service client (avoids module-level env var access)
let _supabase: ReturnType<typeof createClient<Database>> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabase;
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
    if (!(await rateLimit(`n8n:${ip}`, 100, 60000)).success) {
      return ApiErrors.rateLimited();
    }

    // Get webhook secret from header (identifies the webhook config)
    const webhookId = request.headers.get("x-webhook-id");
    const signature = request.headers.get("x-webhook-signature");

    if (!webhookId) {
      return ApiErrors.badRequest("Missing webhook ID");
    }

    // Get webhook config
    const { data: webhook, error: webhookError } = await getSupabase()
      .from("webhook_configs")
      .select("*")
      .eq("id", webhookId)
      .eq("type", "inbound")
      .eq("is_active", true)
      .single();

    if (webhookError || !webhook) {
      return ApiErrors.unauthorized("Invalid or inactive webhook");
    }

    // IP allowlist check
    if (webhook.ip_allowlist && webhook.ip_allowlist.length > 0) {
      if (!webhook.ip_allowlist.includes(ip)) {
        return ApiErrors.forbidden("IP not allowed");
      }
    }

    // Get raw body for signature verification
    const rawBody = await request.text();

    // Verify signature
    if (webhook.secret) {
      if (!verifySignature(rawBody, signature, webhook.secret)) {
        return ApiErrors.unauthorized("Invalid signature");
      }
    }

    // Parse payload
    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return ApiErrors.badRequest("Invalid JSON payload");
    }

    // Validate event type
    const eventType = payload.event || payload.type;
    if (!eventType) {
      return ApiErrors.badRequest("Missing event type");
    }

    if (webhook.events && webhook.events.length > 0 && !webhook.events.includes(eventType)) {
      return ApiErrors.badRequest("Webhook not subscribed to this event");
    }

    // Process the event
    const result = await processWebhookEvent(eventType, payload, webhook.user_id);

    // Update last triggered timestamp
    await getSupabase()
      .from("webhook_configs")
      .update({ last_triggered_at: new Date().toISOString() })
      .eq("id", webhookId);

    // Log the delivery
    await getSupabase().from("webhook_deliveries").insert({
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
    return handleApiError(error, { route: "/api/webhooks/n8n" });
  }
}

// Allowlisted fields per resource type to prevent arbitrary column injection
const ALLOWED_LEAD_FIELDS = [
  "business_name", "email", "phone", "website_url", "industry_category",
  "street_address", "city", "state", "zip_code", "country",
  "status", "lead_temperature", "source", "deal_value", "notes",
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
      const businessName = safeData.business_name as string | undefined;
      if (!businessName) {
        throw new Error("business_name is required for lead creation");
      }
      const { data: lead, error } = await getSupabase()
        .from("businesses")
        .insert({
          business_name: businessName,
          assigned_to: userId,
          source: (safeData.source as string) || "webhook",
          email: safeData.email as string | undefined,
          phone: safeData.phone as string | undefined,
          website_url: safeData.website_url as string | undefined,
          industry_category: safeData.industry_category as string | undefined,
          street_address: safeData.street_address as string | undefined,
          city: safeData.city as string | undefined,
          state: safeData.state as string | undefined,
          zip_code: safeData.zip_code as string | undefined,
          country: safeData.country as string | undefined,
          status: safeData.status as string | undefined,
          lead_temperature: safeData.lead_temperature as string | undefined,
          deal_value: safeData.deal_value as number | undefined,
          notes: safeData.notes as string | undefined,
          expected_close_date: safeData.expected_close_date as string | undefined,
          next_follow_up: safeData.next_follow_up as string | undefined,
          tags: safeData.tags as string[] | undefined,
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
      const { error } = await getSupabase()
        .from("businesses")
        .update(safeData as Database["public"]["Tables"]["businesses"]["Update"])
        .eq("id", leadId)
        .eq("assigned_to", userId);

      if (error) throw error;
      return { action: "lead_updated", resourceId: leadId };
    }

    case "contact.create": {
      const safeData = pickAllowedFields(rawData, ALLOWED_CONTACT_FIELDS);
      const businessId = safeData.business_id as string | undefined;
      if (!businessId) {
        throw new Error("business_id is required for contact creation");
      }
      if (!safeData.first_name || !safeData.last_name) {
        throw new Error("first_name and last_name are required for contact creation");
      }
      const { data: contact, error } = await getSupabase()
        .from("contacts")
        .insert({
          business_id: businessId,
          first_name: safeData.first_name as string | undefined,
          last_name: safeData.last_name as string | undefined,
          email: safeData.email as string | undefined,
          phone: safeData.phone as string | undefined,
          title: safeData.title as string | undefined,
          department: safeData.department as string | undefined,
          linkedin_url: safeData.linkedin_url as string | undefined,
          is_primary: safeData.is_primary as boolean | undefined,
        })
        .select()
        .single();

      if (error) throw error;
      return { action: "contact_created", resourceId: contact.id };
    }

    case "activity.log": {
      const safeData = pickAllowedFields(rawData, ALLOWED_ACTIVITY_FIELDS);
      const activityType = safeData.activity_type as string | undefined;
      const businessId = safeData.business_id as string | undefined;
      if (!activityType) {
        throw new Error("activity_type is required for activity logging");
      }
      if (!businessId) {
        throw new Error("business_id is required for activity logging");
      }
      const { data: activity, error } = await getSupabase()
        .from("activities")
        .insert({
          activity_type: activityType,
          business_id: businessId,
          user_id: userId,
          subject: safeData.subject as string | undefined,
          description: safeData.description as string | undefined,
          outcome: safeData.outcome as string | undefined,
          scheduled_at: safeData.scheduled_at as string | undefined,
          contact_id: safeData.contact_id as string | undefined,
          metadata: safeData.metadata as Database["public"]["Tables"]["activities"]["Insert"]["metadata"],
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
