import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { business_name, email, phone } = await request.json();

    if (!business_name) {
      return NextResponse.json(
        { error: "business_name is required" },
        { status: 400 }
      );
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
      console.error("Duplicate check error:", error);
      return NextResponse.json(
        { error: "Failed to check for duplicates" },
        { status: 500 }
      );
    }

    return NextResponse.json({ duplicates: data || [] });
  } catch (error) {
    console.error("Duplicate check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
