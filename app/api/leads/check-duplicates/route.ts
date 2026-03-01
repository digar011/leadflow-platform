import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
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

    const { business_name, email, phone } = await request.json();

    if (!business_name) {
      return ApiErrors.badRequest("business_name is required");
    }

    // Build OR conditions for similarity
    let query = supabase
      .from("businesses")
      .select("id, business_name, email, phone, status")
      .limit(5);

    // Name similarity (ilike)
    const namePattern = `%${business_name}%`;

    if (email && phone) {
      query = query.or(`business_name.ilike.${namePattern},email.eq.${email},phone.ilike.%${phone.replace(/\D/g, "").slice(-7)}%`);
    } else if (email) {
      query = query.or(`business_name.ilike.${namePattern},email.eq.${email}`);
    } else if (phone) {
      const lastDigits = phone.replace(/\D/g, "").slice(-7);
      query = query.or(`business_name.ilike.${namePattern},phone.ilike.%${lastDigits}%`);
    } else {
      query = query.ilike("business_name", namePattern);
    }

    const { data, error } = await query;

    if (error) {
      return handleApiError(error, { route: "/api/leads/check-duplicates" });
    }

    return NextResponse.json({ success: true, data: { duplicates: data || [] } });
  } catch (error) {
    return handleApiError(error, { route: "/api/leads/check-duplicates" });
  }
}
