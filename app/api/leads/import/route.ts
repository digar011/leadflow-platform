import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { businessSchema } from "@/lib/utils/validation";
import { getNumericLimit } from "@/lib/utils/subscription";
import { rateLimit } from "@/lib/utils/security";
import type { SubscriptionTier } from "@/lib/types/database";

interface ImportRow {
  [key: string]: string | number | null | undefined;
}

interface ImportError {
  row: number;
  field: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!rateLimit(`import:${user.id}`, 10, 60000).success) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const body = await request.json();
    const { rows, duplicateStrategy = "create" } = body as {
      rows: ImportRow[];
      duplicateStrategy: "skip" | "overwrite" | "create";
    };

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "No rows to import" }, { status: 400 });
    }

    if (rows.length > 5000) {
      return NextResponse.json({ error: "Maximum 5000 rows per import" }, { status: 400 });
    }

    // Check lead limit
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_tier")
      .eq("id", user.id)
      .single();

    const tier = (profile?.subscription_tier || "free") as SubscriptionTier;
    const leadLimit = getNumericLimit(tier, "leads");

    const { count: currentCount } = await supabase
      .from("businesses")
      .select("*", { count: "exact", head: true });

    const available = leadLimit === Infinity ? Infinity : leadLimit - (currentCount || 0);

    // Validate and collect results
    const errors: ImportError[] = [];
    const validRows: Record<string, unknown>[] = [];
    let skipped = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      // Clean up row: convert empty strings to null for optional fields
      const cleaned: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(row)) {
        if (value === "" || value === undefined) {
          cleaned[key] = null;
        } else if (key === "lead_score" || key === "deal_value") {
          const num = Number(value);
          cleaned[key] = isNaN(num) ? null : num;
        } else if (key === "tags" && typeof value === "string") {
          cleaned[key] = value.split(",").map((t) => t.trim()).filter(Boolean);
        } else {
          cleaned[key] = value;
        }
      }

      // Default source to "import" if not set
      if (!cleaned.source) {
        cleaned.source = "import";
      }

      // Validate with Zod
      const result = businessSchema.safeParse(cleaned);
      if (!result.success) {
        for (const issue of result.error.issues) {
          errors.push({
            row: i + 1,
            field: issue.path.join(".") || "unknown",
            message: issue.message,
          });
        }
        continue;
      }

      // Duplicate check (skip or overwrite)
      if (duplicateStrategy !== "create") {
        let isDuplicate = false;
        let existingId: string | null = null;

        if (result.data.email) {
          const { data: existing } = await supabase
            .from("businesses")
            .select("id")
            .eq("email", result.data.email)
            .limit(1)
            .maybeSingle();
          if (existing) {
            isDuplicate = true;
            existingId = existing.id;
          }
        }

        if (!isDuplicate && result.data.business_name) {
          const { data: existing } = await supabase
            .from("businesses")
            .select("id")
            .ilike("business_name", result.data.business_name)
            .limit(1)
            .maybeSingle();
          if (existing) {
            isDuplicate = true;
            existingId = existing.id;
          }
        }

        if (isDuplicate) {
          if (duplicateStrategy === "skip") {
            skipped++;
            continue;
          }
          if (duplicateStrategy === "overwrite" && existingId) {
            const { business_name, ...updateData } = result.data;
            await supabase
              .from("businesses")
              .update(updateData)
              .eq("id", existingId);
            skipped++; // count as skipped (not new import)
            continue;
          }
        }
      }

      validRows.push(result.data);
    }

    // Check if we'd exceed the lead limit
    const toInsert = validRows.slice(0, available === Infinity ? validRows.length : available);
    const limitExceeded = validRows.length > toInsert.length;

    if (limitExceeded) {
      const dropped = validRows.length - toInsert.length;
      errors.push({
        row: 0,
        field: "limit",
        message: `${dropped} leads were not imported because you've reached your plan's lead limit (${leadLimit}).`,
      });
    }

    // Batch insert in chunks of 50
    let imported = 0;
    const createdIds: string[] = [];

    for (let i = 0; i < toInsert.length; i += 50) {
      const chunk = toInsert.slice(i, i + 50);
      const { data: inserted, error: insertError } = await supabase
        .from("businesses")
        .insert(chunk)
        .select("id, business_name, email, phone");

      if (insertError) {
        errors.push({
          row: 0,
          field: "insert",
          message: `Batch insert error: ${insertError.message}`,
        });
        continue;
      }

      if (inserted) {
        imported += inserted.length;

        // Auto-create primary contacts for leads with email or phone
        const contacts = inserted
          .filter((lead) => lead.email || lead.phone)
          .map((lead) => ({
            business_id: lead.id,
            first_name: lead.business_name,
            email: lead.email || null,
            phone: lead.phone || null,
            is_primary: true,
          }));

        if (contacts.length > 0) {
          await supabase.from("contacts").insert(contacts);
        }

        createdIds.push(...inserted.map((l) => l.id));
      }
    }

    // Fire automation triggers (fire-and-forget, non-blocking)
    if (createdIds.length > 0) {
      // Only fire for first 10 to avoid overwhelming the automation engine
      const triggerIds = createdIds.slice(0, 10);
      for (const id of triggerIds) {
        fetch(new URL("/api/automation/execute", request.url).toString(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            triggerType: "lead_created",
            triggerData: { businessId: id },
          }),
        }).catch(() => {}); // fire-and-forget
      }
    }

    return NextResponse.json({
      imported,
      skipped,
      errors: errors.slice(0, 100), // Limit error output
      total: rows.length,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
