import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getResend, EMAIL_FROM } from "@/lib/email/resend";
import { getNewUserWelcomeSubject, getNewUserWelcomeHtml } from "@/lib/email/templates";
import { ApiErrors, handleApiError } from "@/lib/utils/api-errors";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return ApiErrors.unauthorized();
    }

    const { email, fullName } = await request.json();

    if (!email || !fullName) {
      return ApiErrors.badRequest("Missing required fields: email, fullName");
    }

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "";
    const loginUrl = `${origin}/login`;

    const { data, error } = await getResend().emails.send({
      from: EMAIL_FROM,
      to: [email],
      subject: getNewUserWelcomeSubject(),
      html: getNewUserWelcomeHtml({ fullName, loginUrl }),
    });

    if (error) {
      return handleApiError(error, { route: "/api/email/welcome", userId: user.id });
    }

    return NextResponse.json({ success: true, data: { messageId: data?.id } });
  } catch (error) {
    return handleApiError(error, { route: "/api/email/welcome" });
  }
}
