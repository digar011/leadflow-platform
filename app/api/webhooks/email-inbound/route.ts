import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import {
  classifyDirection,
  extractEmail,
  parseEmailAddresses,
  matchEmailToLead,
  getBodySnippet,
} from "@/lib/utils/emailCapture";

import { rateLimit } from "@/lib/utils/security";
import { ApiErrors, handleApiError } from "@/lib/utils/api-errors";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function verifyResendSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature || !secret) return !secret; // If no secret configured, skip verification
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature)
    );
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";

    if (!(await rateLimit(`email-inbound:${ip}`, 100, 60000)).success) {
      return ApiErrors.rateLimited();
    }

    const rawBody = await request.text();

    // Verify webhook signature — reject if secret is not configured
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return ApiErrors.serviceUnavailable("Webhook not configured");
    }
    const signature = request.headers.get("resend-signature") || request.headers.get("x-webhook-signature");
    if (!verifyResendSignature(rawBody, signature, webhookSecret)) {
      return ApiErrors.unauthorized("Invalid signature");
    }

    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return ApiErrors.badRequest("Invalid JSON");
    }

    // Resend inbound webhook payload fields
    const {
      from,
      to,
      cc,
      subject,
      text,
      headers: emailHeaders,
    } = payload as {
      from: string;
      to: string | string[];
      cc?: string | string[];
      subject?: string;
      text?: string;
      html?: string;
      headers?: Record<string, string>;
    };

    if (!from || !to) {
      return ApiErrors.badRequest("Missing from/to fields");
    }

    const supabase = getSupabase();

    // Find the forwarding address in to/cc
    const allRecipients = [
      ...(Array.isArray(to) ? to : [to]),
      ...(cc ? (Array.isArray(cc) ? cc : [cc]) : []),
    ];

    let forwardingAddress: string | null = null;
    for (const recipient of allRecipients) {
      const email = extractEmail(recipient);
      if (email.startsWith("crm-") && email.includes("@inbound.")) {
        forwardingAddress = email;
        break;
      }
    }

    if (!forwardingAddress) {
      return ApiErrors.badRequest("No forwarding address found");
    }

    // Look up user by forwarding address
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("email_forwarding_address", forwardingAddress)
      .single();

    if (!profile) {
      return ApiErrors.notFound("Forwarding address");
    }

    const userId = profile.id;
    const userEmail = profile.email;

    // Parse all email addresses (excluding forwarding address)
    const emailAddresses = parseEmailAddresses(from, to, cc, forwardingAddress);

    // Classify direction
    const fromEmail = extractEmail(from);
    const direction = classifyDirection(fromEmail, userEmail);

    // Match to existing lead
    const match = await matchEmailToLead(supabase, userId, emailAddresses);

    // Get message ID for dedup
    const messageId = emailHeaders?.["message-id"] || emailHeaders?.["Message-ID"] || null;

    // Get body snippet
    const bodySnippet = getBodySnippet(text);

    // Create activity if matched
    let activityId: string | null = null;
    if (match) {
      const activityType = direction === "outbound" ? "email_sent" : "email_received";
      const { data: activity } = await supabase
        .from("activities")
        .insert({
          business_id: match.businessId,
          contact_id: match.contactId || null,
          user_id: userId,
          activity_type: activityType,
          subject: subject || "(no subject)",
          description: bodySnippet || null,
          metadata: {
            source: "email_capture",
            from: fromEmail,
            to: Array.isArray(to) ? to.map(extractEmail) : [extractEmail(to)],
            message_id: messageId,
          },
        })
        .select("id")
        .single();

      activityId = activity?.id || null;
    }

    // Store captured email (with or without match)
    const toAddresses = Array.isArray(to) ? to.map(extractEmail) : [extractEmail(to)];
    const ccAddresses = cc
      ? (Array.isArray(cc) ? cc.map(extractEmail) : [extractEmail(cc)])
      : [];

    await supabase.from("captured_emails").insert({
      user_id: userId,
      business_id: match?.businessId || null,
      direction,
      from_address: fromEmail,
      to_addresses: toAddresses,
      cc_addresses: ccAddresses,
      subject: subject || null,
      body_snippet: bodySnippet,
      message_id: messageId,
      matched: !!match,
      activity_id: activityId,
    });

    return NextResponse.json({
      success: true,
      matched: !!match,
      businessId: match?.businessId || null,
      activityId,
    });
  } catch (error) {
    return handleApiError(error, { route: "/api/webhooks/email-inbound" });
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Email inbound webhook endpoint is active",
  });
}
