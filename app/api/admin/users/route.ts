import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createServiceSupabaseClient } from "@/lib/supabase/server";

// Verify the requesting user is an admin
async function verifyAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!["super_admin", "org_admin", "admin"].includes(profile?.role ?? "")) return null;
  return user.id;
}

// PATCH - Update user role, tier, active status, or permissions
export async function PATCH(request: NextRequest) {
  try {
    const adminId = await verifyAdmin();
    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, action, ...params } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: "Missing userId or action" }, { status: 400 });
    }

    // Use service role to bypass protect_profile_columns trigger
    const serviceClient = await createServiceSupabaseClient();

    switch (action) {
      case "updateRole": {
        const { role } = params;
        if (!["super_admin", "org_admin", "admin", "manager", "user"].includes(role)) {
          return NextResponse.json({ error: "Invalid role" }, { status: 400 });
        }
        const { data, error } = await serviceClient
          .from("profiles")
          .update({ role })
          .eq("id", userId)
          .select()
          .single();
        if (error) throw error;
        return NextResponse.json(data);
      }

      case "updateTier": {
        const { tier, billingCycle } = params;
        if (!["free", "starter", "growth", "business", "enterprise"].includes(tier)) {
          return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
        }
        const updates: Record<string, string> = { subscription_tier: tier };
        if (billingCycle) updates.subscription_billing_cycle = billingCycle;

        const { data, error } = await serviceClient
          .from("profiles")
          .update(updates)
          .eq("id", userId)
          .select()
          .single();
        if (error) throw error;
        return NextResponse.json(data);
      }

      case "toggleActive": {
        const { isActive } = params;
        const { data, error } = await serviceClient
          .from("profiles")
          .update({ is_active: isActive })
          .eq("id", userId)
          .select()
          .single();
        if (error) throw error;
        return NextResponse.json(data);
      }

      case "updatePermissions": {
        const { permissions } = params;
        const { data, error } = await serviceClient
          .from("profiles")
          .update({ permissions })
          .eq("id", userId)
          .select()
          .single();
        if (error) throw error;
        return NextResponse.json(data);
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Admin users API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
