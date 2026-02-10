import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { CSV_EXPORT_FIELDS } from "@/lib/utils/csvFields";
import { rateLimit } from "@/lib/utils/security";
import Papa from "papaparse";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!rateLimit(`export:${user.id}`, 5, 60000).success) {
      return NextResponse.json({ error: "Rate limit exceeded. Max 5 exports per minute." }, { status: 429 });
    }

    // Parse filter params
    const params = request.nextUrl.searchParams;
    const status = params.get("status");
    const temperature = params.get("temperature");
    const source = params.get("source");
    const search = params.get("search");
    const dateFrom = params.get("dateFrom");
    const dateTo = params.get("dateTo");
    const tags = params.get("tags");

    // Build query (mirrors useLeads filter logic)
    let query = supabase.from("businesses").select("*");

    if (status) query = query.eq("status", status);
    if (temperature) query = query.eq("lead_temperature", temperature);
    if (source) query = query.eq("source", source);
    if (search) {
      const sanitized = search.replace(/['"`;\\,.()\[\]{}]/g, "").trim();
      if (sanitized) {
        query = query.or(
          `business_name.ilike.%${sanitized}%,email.ilike.%${sanitized}%,city.ilike.%${sanitized}%`
        );
      }
    }
    if (dateFrom) query = query.gte("created_at", dateFrom);
    if (dateTo) query = query.lte("created_at", dateTo);
    if (tags) {
      const tagsArray = tags.split(",").filter(Boolean);
      if (tagsArray.length > 0) query = query.overlaps("tags", tagsArray);
    }

    query = query.order("created_at", { ascending: false });

    const { data: leads, error } = await query;

    if (error) {
      return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
    }

    if (!leads || leads.length === 0) {
      return NextResponse.json({ error: "No leads to export" }, { status: 404 });
    }

    // Map leads to export fields
    const exportKeys = CSV_EXPORT_FIELDS.map((f) => f.key);
    const rows = leads.map((lead: Record<string, unknown>) => {
      const row: Record<string, string> = {};
      for (const field of CSV_EXPORT_FIELDS) {
        const value = lead[field.key];
        if (field.key === "tags" && Array.isArray(value)) {
          row[field.label] = value.join(", ");
        } else if (value === null || value === undefined) {
          row[field.label] = "";
        } else {
          row[field.label] = String(value);
        }
      }
      return row;
    });

    const csv = Papa.unparse(rows);

    const date = new Date().toISOString().split("T")[0];
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=leads-export-${date}.csv`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
