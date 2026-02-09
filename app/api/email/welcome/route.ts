import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getResend, EMAIL_FROM } from "@/lib/email/resend";
import { getNewUserWelcomeSubject, getNewUserWelcomeHtml } from "@/lib/email/templates";

export async function POST(request: NextRequest) {
  try {
    // Require authentication to prevent unauthenticated email sending
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { email, fullName } = await request.json();

    if (!email || !fullName) {
      return NextResponse.json(
        { error: "Missing required fields: email, fullName" },
        { status: 400 }
      );
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
      console.error("Welcome email error:", error);
      return NextResponse.json(
        { error: "Failed to send welcome email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, messageId: data?.id });
  } catch (error) {
    console.error("Welcome email error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
