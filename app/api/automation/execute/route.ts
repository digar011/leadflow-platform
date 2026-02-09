import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  executeAutomationRules,
  type TriggerData,
} from "@/lib/automation/engine";

export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { triggerType, triggerData } = (await request.json()) as {
      triggerType: string;
      triggerData: TriggerData;
    };

    if (!triggerType || !triggerData?.businessId) {
      return NextResponse.json(
        { error: "Missing triggerType or triggerData.businessId" },
        { status: 400 }
      );
    }

    const results = await executeAutomationRules(
      triggerType,
      triggerData,
      user.id
    );

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Automation execution error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
