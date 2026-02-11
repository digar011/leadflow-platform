import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://kitimzmjjuvznfiyjiuw.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpdGltem1qanV2em5maXlqaXV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMDIxNDksImV4cCI6MjA4NDg3ODE0OX0.IJ3XCq7QHEHvPqm2HYXsW6N0RxF0Rbl7uSPZdpaMkJk";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpdGltem1qanV2em5maXlqaXV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTMwMjE0OSwiZXhwIjoyMDg0ODc4MTQ5fQ.c__RfaNQlw335ASnt_N437-dlVclrFFRa_vfppEE7qM";

async function test() {
  // Step 1: Check admin profile via service role
  const admin = createClient(SUPABASE_URL, SERVICE_KEY);

  const { data: adminProfile, error: profileErr } = await admin
    .from("profiles")
    .select("id, email, role")
    .eq("email", "diego.j.garnica@gmail.com")
    .single();

  console.log("Admin profile:", adminProfile, profileErr?.message);

  // Step 2: Check total businesses count (service role, no RLS)
  const { data: allBusinesses, count: totalCount } = await admin
    .from("businesses")
    .select("id, business_name, assigned_to", { count: "exact" });
  console.log(`Total businesses (service role): ${totalCount}`);
  if (allBusinesses?.length) {
    console.log("Sample assigned_to values:", allBusinesses.slice(0, 5).map(b => ({name: b.business_name, assigned_to: b.assigned_to})));
  }

  // Step 3: Sign in as admin user via anon client
  const anon = createClient(SUPABASE_URL, ANON_KEY);
  const { data: authData, error: authErr } = await anon.auth.signInWithPassword({
    email: "diego.j.garnica@gmail.com",
    password: "Diego2025!",
  });

  if (authErr) {
    console.log("Auth error:", authErr.message);
    // Try the test admin account
    const { data: auth2, error: authErr2 } = await anon.auth.signInWithPassword({
      email: "admin123@test.com",
      password: "Test123!",
    });
    if (authErr2) {
      console.log("Both auth attempts failed:", authErr2.message);
      return;
    }
    console.log("Signed in as admin123@test.com");
  } else {
    console.log("Signed in as diego.j.garnica@gmail.com");
  }

  // Step 4: Test RLS - query businesses as admin
  const { data: adminBusinesses, count: adminCount, error: rlsErr } = await anon
    .from("businesses")
    .select("id, business_name, assigned_to, status", { count: "exact" });

  console.log(`Businesses visible to admin (RLS): ${adminCount}`, rlsErr?.message || "");

  // Step 5: Test activities as admin
  const { data: adminActivities, count: actCount, error: actErr } = await anon
    .from("activities")
    .select("id, activity_type, created_at", { count: "exact" })
    .limit(5);

  console.log(`Activities visible to admin: ${actCount}`, actErr?.message || "");

  // Step 6: Test contacts as admin
  const { data: adminContacts, count: contactCount, error: contactErr } = await anon
    .from("contacts")
    .select("id, first_name, last_name", { count: "exact" })
    .limit(5);

  console.log(`Contacts visible to admin: ${contactCount}`, contactErr?.message || "");

  // Step 7: Test campaigns as admin
  const { data: adminCampaigns, count: campCount, error: campErr } = await anon
    .from("campaigns")
    .select("id, name, status", { count: "exact" })
    .limit(5);

  console.log(`Campaigns visible to admin: ${campCount}`, campErr?.message || "");

  // Step 8: Check is_admin() function
  const { data: isAdmin, error: isAdminErr } = await anon.rpc("is_admin");
  console.log("is_admin() result:", isAdmin, isAdminErr?.message || "");
}

test().catch(console.error);
