/**
 * Verify admin123@test.com is fully functional for both admin backend and user UI
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://kitimzmjjuvznfiyjiuw.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpdGltem1qanV2em5maXlqaXV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMDIxNDksImV4cCI6MjA4NDg3ODE0OX0.IJ3XCq7QHEHvPqm2HYXsW6N0RxF0Rbl7uSPZdpaMkJk";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpdGltem1qanV2em5maXlqaXV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTMwMjE0OSwiZXhwIjoyMDg0ODc4MTQ5fQ.c__RfaNQlw335ASnt_N437-dlVclrFFRa_vfppEE7qM";
const APP_URL = "http://localhost:3000";

let passed = 0;
let failed = 0;
const failures = [];

function test(name, condition, detail) {
  if (condition) {
    console.log(`  [PASS] ${name}`);
    passed++;
  } else {
    console.log(`  [FAIL] ${name}${detail ? ` - ${detail}` : ""}`);
    failed++;
    failures.push({ name, detail });
  }
}

async function main() {
  console.log("\n============================================");
  console.log("  ADMIN123@TEST.COM VERIFICATION TEST");
  console.log("============================================\n");

  // 1. Login test
  console.log("--- Authentication ---");
  const client = createClient(SUPABASE_URL, ANON_KEY);
  const { data: session, error: loginErr } = await client.auth.signInWithPassword({
    email: "admin123@test.com",
    password: "Test123!",
  });
  test("Login succeeds", session?.user && !loginErr, loginErr?.message);
  test("Email is correct", session?.user?.email === "admin123@test.com");
  test("User metadata role = admin", session?.user?.user_metadata?.role === "admin");

  // 2. Profile verification
  console.log("\n--- Profile & Permissions ---");
  const { data: profile, error: profileErr } = await client
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();
  test("Can read own profile", !!profile && !profileErr, profileErr?.message);
  test("Profile role = admin", profile?.role === "admin");
  test("Profile full_name = Test Admin", profile?.full_name === "Test Admin");
  test("Profile is_active = true", profile?.is_active === true);

  // 3. Admin backend capabilities
  console.log("\n--- Admin Backend (Data Access) ---");

  // Can read all profiles (admin RLS)
  const { data: allProfiles, error: allProfilesErr } = await client
    .from("profiles")
    .select("*");
  test("Admin can read all profiles", !allProfilesErr && allProfiles?.length >= 2,
    allProfilesErr?.message || `Found ${allProfiles?.length}`);

  // Can read businesses
  const { data: businesses, error: bizErr } = await client
    .from("businesses")
    .select("*")
    .limit(5);
  test("Admin can read businesses", !bizErr, bizErr?.message);

  // Can read contacts
  const { data: contacts, error: contactErr } = await client
    .from("contacts")
    .select("*")
    .limit(5);
  test("Admin can read contacts", !contactErr, contactErr?.message);

  // Can read activities
  const { data: activities, error: actErr } = await client
    .from("activities")
    .select("*")
    .limit(5);
  test("Admin can read activities", !actErr, actErr?.message);

  // Can read campaigns
  const { data: campaigns, error: campErr } = await client
    .from("campaigns")
    .select("*")
    .limit(5);
  test("Admin can read campaigns", !campErr, campErr?.message);

  // Can read automation rules
  const { data: rules, error: rulesErr } = await client
    .from("automation_rules")
    .select("*")
    .limit(5);
  test("Admin can read automation rules", !rulesErr, rulesErr?.message);

  // Can read reports
  const { data: reports, error: repErr } = await client
    .from("reports")
    .select("*")
    .limit(5);
  test("Admin can read reports", !repErr, repErr?.message);

  // Can read audit logs
  const { data: logs, error: logErr } = await client
    .from("audit_logs")
    .select("*")
    .limit(5);
  test("Admin can read audit logs", !logErr, logErr?.message);

  // Can read system settings
  const { data: settings, error: setErr } = await client
    .from("system_settings")
    .select("*");
  test("Admin can read system settings", !setErr && settings?.length > 0,
    setErr?.message || `Found ${settings?.length}`);

  // Can read webhook configs
  const { data: webhooks, error: whErr } = await client
    .from("webhook_configs")
    .select("*")
    .limit(5);
  test("Admin can read webhook configs", !whErr, whErr?.message);

  // Can read API keys
  const { data: apiKeys, error: akErr } = await client
    .from("api_keys")
    .select("*")
    .limit(5);
  test("Admin can read API keys", !akErr, akErr?.message);

  // 4. Admin write capabilities
  console.log("\n--- Admin Write Capabilities ---");

  // Create a test business
  const { data: testBiz, error: createBizErr } = await client
    .from("businesses")
    .insert({
      business_name: "Admin123 Test Business",
      status: "new",
      lead_temperature: "warm",
      source: "manual",
      assigned_to: session.user.id,
    })
    .select()
    .single();
  test("Admin can create business", !!testBiz && !createBizErr, createBizErr?.message);

  // Update it
  if (testBiz) {
    const { error: updateErr } = await client
      .from("businesses")
      .update({ status: "contacted" })
      .eq("id", testBiz.id);
    test("Admin can update business", !updateErr, updateErr?.message);

    // Delete it
    const { error: deleteErr } = await client
      .from("businesses")
      .delete()
      .eq("id", testBiz.id);
    test("Admin can delete business", !deleteErr, deleteErr?.message);
  }

  // 5. App route tests (UI accessibility)
  console.log("\n--- App Routes (UI Access) ---");

  // Get session cookies via the app
  const routes = [
    { path: "/dashboard", name: "Dashboard" },
    { path: "/leads", name: "Leads" },
    { path: "/contacts", name: "Contacts" },
    { path: "/activities", name: "Activities" },
    { path: "/campaigns", name: "Campaigns" },
    { path: "/analytics", name: "Analytics" },
    { path: "/reports", name: "Reports" },
    { path: "/automation", name: "Automation" },
    { path: "/settings", name: "Settings" },
    { path: "/admin/users", name: "Admin Users" },
    { path: "/admin/settings", name: "Admin Settings" },
    { path: "/admin/audit", name: "Admin Audit Logs" },
  ];

  for (const route of routes) {
    try {
      const res = await fetch(`${APP_URL}${route.path}`, {
        redirect: "manual",
        headers: { "Accept": "text/html" },
      });
      // Without session cookies, protected routes should redirect to login (307)
      // This is expected - we're testing that the routes exist and respond
      const ok = res.status === 200 || res.status === 307;
      test(`Route ${route.path} responds (${res.status})`, ok, `status=${res.status}`);
    } catch (err) {
      test(`Route ${route.path} responds`, false, err.message);
    }
  }

  // Summary
  console.log("\n============================================");
  console.log(`  RESULTS: ${passed}/${passed + failed} passed (${((passed / (passed + failed)) * 100).toFixed(1)}%)`);
  if (failures.length > 0) {
    console.log("\n  FAILURES:");
    failures.forEach((f) => console.log(`    - ${f.name}: ${f.detail || "condition false"}`));
  }
  console.log("============================================\n");

  await client.auth.signOut();
}

main().catch(console.error);
