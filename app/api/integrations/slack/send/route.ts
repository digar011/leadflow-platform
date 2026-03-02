import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  sendSlackMessage,
  formatLeadCreatedMessage,
  formatStatusChangedMessage,
  formatDealWonMessage,
  formatCustomMessage,
} from "@/lib/slack/send";
import { ApiErrors, handleApiError } from "@/lib/utils/api-errors";

/**
 * Internal API for sending Slack messages.
 * Called by authenticated users. Requires valid Supabase session.
 */

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    // Verify authenticated user
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return ApiErrors.unauthorized();
    }

    const body = await request.json();
    const { userId, event, data } = body as {
      userId: string;
      event: string;
      data: Record<string, unknown>;
    };

    if (!userId || !event) {
      return ApiErrors.badRequest("Missing userId or event");
    }

    const serviceClient = getServiceClient();

    // Look up user's Slack config
    const { data: slackKey } = await serviceClient
      .from("api_keys")
      .select("external_key, scopes, is_active")
      .eq("integration_type", "slack")
      .eq("user_id", userId)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    if (!slackKey?.external_key) {
      return ApiErrors.badRequest("Slack not configured");
    }

    // Check if event is enabled
    let enabledEvents: string[] = [];
    try {
      const meta = JSON.parse(slackKey.scopes?.[0] || "{}");
      enabledEvents = meta.enabledEvents || [];
    } catch {
      // default: no events enabled
    }

    if (!enabledEvents.includes(event)) {
      return NextResponse.json({ success: true, data: { skipped: true, reason: "Event not enabled" } });
    }

    // Build message based on event type
    let text: string;
    let blocks: unknown[] | undefined;

    switch (event) {
      case "lead_created": {
        const msg = formatLeadCreatedMessage({
          business_name: (data.businessName as string) || "Unknown",
          email: data.email as string | undefined,
          source: data.source as string | undefined,
          deal_value: data.dealValue as number | undefined,
        });
        text = msg.text;
        blocks = msg.blocks;
        break;
      }
      case "status_changed": {
        const msg = formatStatusChangedMessage({
          business_name: (data.businessName as string) || "Unknown",
          oldStatus: (data.oldStatus as string) || "unknown",
          newStatus: (data.newStatus as string) || "unknown",
        });
        text = msg.text;
        blocks = msg.blocks;
        break;
      }
      case "deal_won": {
        const msg = formatDealWonMessage({
          business_name: (data.businessName as string) || "Unknown",
          deal_value: data.dealValue as number | undefined,
        });
        text = msg.text;
        blocks = msg.blocks;
        break;
      }
      default: {
        // Custom message
        if (data.messageTemplate) {
          const msg = formatCustomMessage(
            data.messageTemplate as string,
            data as Record<string, string>
          );
          text = msg.text;
          blocks = msg.blocks;
        } else {
          text = `Goldyon CRM: ${event} — ${(data.businessName as string) || ""}`;
        }
      }
    }

    const result = await sendSlackMessage({
      webhookUrl: slackKey.external_key,
      text,
      blocks: blocks as Parameters<typeof sendSlackMessage>[0]["blocks"],
    });

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    return handleApiError(err, { route: "/api/integrations/slack/send" });
  }
}
