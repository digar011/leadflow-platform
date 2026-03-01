import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  executeAutomationRules,
  type TriggerData,
} from "@/lib/automation/engine";
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

    const { triggerType, triggerData } = (await request.json()) as {
      triggerType: string;
      triggerData: TriggerData;
    };

    if (!triggerType || !triggerData?.businessId) {
      return ApiErrors.badRequest("Missing triggerType or triggerData.businessId");
    }

    const results = await executeAutomationRules(
      triggerType,
      triggerData,
      user.id
    );

    return NextResponse.json({ success: true, data: { results } });
  } catch (error) {
    return handleApiError(error, { route: "/api/automation/execute" });
  }
}
