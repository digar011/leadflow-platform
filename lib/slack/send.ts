/**
 * Slack Incoming Webhook message sender.
 * No SDK required — plain HTTP POST with Block Kit formatting.
 */

interface SlackBlock {
  type: string;
  text?: { type: string; text: string; emoji?: boolean };
  fields?: { type: string; text: string }[];
  elements?: { type: string; text?: { type: string; text: string }; url?: string; action_id?: string }[];
  accessory?: unknown;
}

interface SlackMessageOptions {
  webhookUrl: string;
  text: string;
  blocks?: SlackBlock[];
}

/**
 * Send a message to a Slack Incoming Webhook URL.
 * Validates URL to prevent SSRF — only allows hooks.slack.com.
 */
export async function sendSlackMessage(
  options: SlackMessageOptions
): Promise<{ ok: boolean; error?: string }> {
  const { webhookUrl, text, blocks } = options;

  // SSRF prevention
  if (
    !webhookUrl.startsWith("https://hooks.slack.com/") &&
    !webhookUrl.startsWith("https://hooks.slack-gov.com/")
  ) {
    return { ok: false, error: "Invalid Slack webhook URL" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const body: Record<string, unknown> = { text };
    if (blocks?.length) {
      body.blocks = blocks;
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const responseText = await response.text().catch(() => "");
      return {
        ok: false,
        error: `Slack returned ${response.status}: ${responseText || response.statusText}`,
      };
    }

    return { ok: true };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return { ok: false, error: "Slack webhook timed out (5s)" };
    }
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Pre-built message templates ────────────────────────────────────

export function formatTestMessage(): { text: string; blocks: SlackBlock[] } {
  return {
    text: "Goldyon CRM connected successfully!",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Goldyon CRM connected successfully!* :tada:\nYou will now receive notifications from your CRM in this channel.",
        },
      },
    ],
  };
}

export function formatLeadCreatedMessage(lead: {
  business_name: string;
  email?: string | null;
  source?: string | null;
  deal_value?: number | null;
}): { text: string; blocks: SlackBlock[] } {
  const text = `New lead: ${lead.business_name}`;
  const fields: { type: string; text: string }[] = [];

  if (lead.email) fields.push({ type: "mrkdwn", text: `*Email:*\n${lead.email}` });
  if (lead.source) fields.push({ type: "mrkdwn", text: `*Source:*\n${lead.source}` });
  if (lead.deal_value) {
    fields.push({
      type: "mrkdwn",
      text: `*Deal Value:*\n$${lead.deal_value.toLocaleString()}`,
    });
  }

  const blocks: SlackBlock[] = [
    {
      type: "section",
      text: { type: "mrkdwn", text: `:sparkles: *New Lead Created*\n*${lead.business_name}*` },
    },
  ];

  if (fields.length) {
    blocks.push({ type: "section", fields });
  }

  return { text, blocks };
}

export function formatStatusChangedMessage(lead: {
  business_name: string;
  oldStatus: string;
  newStatus: string;
}): { text: string; blocks: SlackBlock[] } {
  const text = `${lead.business_name}: ${lead.oldStatus} → ${lead.newStatus}`;

  return {
    text,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `:arrows_counterclockwise: *Status Changed*\n*${lead.business_name}*\n${formatStatus(lead.oldStatus)} → ${formatStatus(lead.newStatus)}`,
        },
      },
    ],
  };
}

export function formatDealWonMessage(lead: {
  business_name: string;
  deal_value?: number | null;
}): { text: string; blocks: SlackBlock[] } {
  const valueStr = lead.deal_value
    ? ` worth $${lead.deal_value.toLocaleString()}`
    : "";
  const text = `Deal won: ${lead.business_name}${valueStr}`;

  return {
    text,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `:trophy: *Deal Won!*\n*${lead.business_name}*${valueStr}`,
        },
      },
    ],
  };
}

/**
 * Interpolate {{variable}} placeholders in a template string.
 */
export function formatCustomMessage(
  template: string,
  data: Record<string, string>
): { text: string; blocks: SlackBlock[] } {
  let text = template;
  for (const [key, value] of Object.entries(data)) {
    text = text.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value || "");
  }

  return {
    text,
    blocks: [
      {
        type: "section",
        text: { type: "mrkdwn", text },
      },
    ],
  };
}

function formatStatus(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}
