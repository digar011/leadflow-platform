import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sendSlackMessage, formatTestMessage } from "@/lib/slack/send";
import { ApiErrors, handleApiError } from "@/lib/utils/api-errors";

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return ApiErrors.unauthorized();
    }

    const { data: slackKey, error } = await supabase
      .from("api_keys")
      .select("external_key, is_active")
      .eq("integration_type", "slack")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    if (error) {
      return handleApiError(error, { route: "/api/integrations/slack/test" });
    }

    if (!slackKey?.external_key) {
      return ApiErrors.badRequest("Slack not configured. Add a webhook URL first.");
    }

    const { text, blocks } = formatTestMessage();
    const result = await sendSlackMessage({
      webhookUrl: slackKey.external_key,
      text,
      blocks,
    });

    if (!result.ok) {
      return ApiErrors.badRequest(result.error || "Slack message delivery failed");
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err, { route: "/api/integrations/slack/test" });
  }
}
