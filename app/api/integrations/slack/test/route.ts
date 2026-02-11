import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sendSlackMessage, formatTestMessage } from "@/lib/slack/send";

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Look up Slack config from api_keys
    const { data: slackKey, error } = await supabase
      .from("api_keys")
      .select("external_key, is_active")
      .eq("integration_type", "slack")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: "Failed to read config" }, { status: 500 });
    }

    if (!slackKey?.external_key) {
      return NextResponse.json(
        { error: "Slack not configured. Add a webhook URL first." },
        { status: 400 }
      );
    }

    const { text, blocks } = formatTestMessage();
    const result = await sendSlackMessage({
      webhookUrl: slackKey.external_key,
      text,
      blocks,
    });

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
