import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getResend, EMAIL_FROM } from "@/lib/email/resend";
import { rateLimit } from "@/lib/utils/security";
import { ApiErrors, handleApiError } from "@/lib/utils/api-errors";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return ApiErrors.unauthorized();
    }

    const rateLimitResult = await rateLimit(`email:${user.id}`, 20, 60000);
    if (!rateLimitResult.success) {
      return ApiErrors.rateLimited();
    }

    const { to, subject, html, replyTo } = await request.json();

    if (!to || !subject || !html) {
      return ApiErrors.badRequest("Missing required fields: to, subject, html");
    }

    const { data, error } = await getResend().emails.send({
      from: EMAIL_FROM,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      replyTo: replyTo || user.email || undefined,
    });

    if (error) {
      return handleApiError(error, { route: "/api/email/send", userId: user.id });
    }

    return NextResponse.json({ success: true, data: { messageId: data?.id } });
  } catch (error) {
    return handleApiError(error, { route: "/api/email/send" });
  }
}
