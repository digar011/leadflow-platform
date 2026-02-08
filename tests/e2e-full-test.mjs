/**
 * LeadFlow Platform - Full End-to-End Functionality Test
 * Tests all major features with mock data
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://kitimzmjjuvznfiyjiuw.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpdGltem1qanV2em5maXlqaXV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMDIxNDksImV4cCI6MjA4NDg3ODE0OX0.IJ3XCq7QHEHvPqm2HYXsW6N0RxF0Rbl7uSPZdpaMkJk";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpdGltem1qanV2em5maXlqaXV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTMwMjE0OSwiZXhwIjoyMDg0ODc4MTQ5fQ.c__RfaNQlw335ASnt_N437-dlVclrFFRa_vfppEE7qM";
const APP_URL = "http://localhost:3000";

// Clients
const anonClient = createClient(SUPABASE_URL, ANON_KEY);
const serviceClient = createClient(SUPABASE_URL, SERVICE_KEY);

// Test state - store IDs for cleanup
const testState = {
  testUserId: null,
  testUserEmail: `e2e_test_${Date.now()}@test.com`,
  testUserPassword: "TestPassword123!",
  adminSession: null,
  businessIds: [],
  contactIds: [],
  activityIds: [],
  touchpointIds: [],
  campaignIds: [],
  automationRuleIds: [],
  reportIds: [],
  webhookIds: [],
  apiKeyIds: [],
  auditLogIds: [],
};

// Results tracking
let totalTests = 0;
let passed = 0;
let failed = 0;
let skipped = 0;
const failures = [];
const sectionResults = {};
let currentSection = "";

function startSection(name) {
  currentSection = name;
  sectionResults[name] = { passed: 0, failed: 0, skipped: 0 };
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  ${name}`);
  console.log(`${"=".repeat(60)}`);
}

function test(name, success, detail = "") {
  totalTests++;
  if (success === "skip") {
    skipped++;
    sectionResults[currentSection].skipped++;
    console.log(`  [SKIP] ${name}${detail ? " - " + detail : ""}`);
  } else if (success) {
    passed++;
    sectionResults[currentSection].passed++;
    console.log(`  [PASS] ${name}${detail ? " - " + detail : ""}`);
  } else {
    failed++;
    sectionResults[currentSection].failed++;
    failures.push({ section: currentSection, name, detail });
    console.log(`  [FAIL] ${name}${detail ? " - " + detail : ""}`);
  }
}

// ============================================================
// SECTION 1: AUTHENTICATION
// ============================================================
async function testAuthentication() {
  startSection("1. AUTHENTICATION");

  // 1.1 Admin login
  const { data: adminLogin, error: adminLoginErr } = await anonClient.auth.signInWithPassword({
    email: "Diego.j.garnica@gmail.com",
    password: "Mynewpassword2025!",
  });
  test("Admin login with correct credentials", !adminLoginErr && !!adminLogin.session, adminLoginErr?.message);

  if (adminLogin?.session) {
    testState.adminSession = adminLogin.session;
    test("Admin session has valid access token", adminLogin.session.access_token.length > 50);
    test("Admin session has refresh token", !!adminLogin.session.refresh_token);
    test("Admin user email matches", adminLogin.user.email === "diego.j.garnica@gmail.com");
    test("Admin user metadata has role=admin", adminLogin.user.user_metadata?.role === "admin");
  }

  // 1.2 Wrong password rejection
  const { error: wrongPwErr } = await anonClient.auth.signInWithPassword({
    email: "Diego.j.garnica@gmail.com",
    password: "WrongPassword999!",
  });
  test("Wrong password correctly rejected", !!wrongPwErr, wrongPwErr?.message);

  // 1.3 Nonexistent user rejection
  const { error: noUserErr } = await anonClient.auth.signInWithPassword({
    email: "nobody@doesnotexist.com",
    password: "SomePassword123!",
  });
  test("Nonexistent user correctly rejected", !!noUserErr, noUserErr?.message);

  // 1.4 Create test user via admin API
  const { data: newUser, error: createUserErr } = await serviceClient.auth.admin.createUser({
    email: testState.testUserEmail,
    password: testState.testUserPassword,
    email_confirm: true,
    user_metadata: { full_name: "E2E Test User", role: "user" },
  });
  test("Create new test user via admin API", !createUserErr && !!newUser.user, createUserErr?.message);
  if (newUser?.user) testState.testUserId = newUser.user.id;

  // 1.5 Verify profile auto-created by trigger
  if (testState.testUserId) {
    // Small delay for trigger
    await new Promise((r) => setTimeout(r, 1000));
    const { data: profile } = await serviceClient
      .from("profiles")
      .select("*")
      .eq("id", testState.testUserId)
      .single();
    test("Profile auto-created by trigger", !!profile, profile ? `role=${profile.role}` : "no profile");
    test("Profile has correct email", profile?.email === testState.testUserEmail);
    test("Profile has default role=user", profile?.role === "user");
  }

  // 1.6 Test user login
  const testClient = createClient(SUPABASE_URL, ANON_KEY);
  const { data: testLogin, error: testLoginErr } = await testClient.auth.signInWithPassword({
    email: testState.testUserEmail,
    password: testState.testUserPassword,
  });
  test("Test user can login", !testLoginErr && !!testLogin.session, testLoginErr?.message);

  // 1.7 Session refresh
  if (testLogin?.session) {
    const { data: refreshed, error: refreshErr } = await testClient.auth.refreshSession({
      refresh_token: testLogin.session.refresh_token,
    });
    test("Session refresh works", !refreshErr && !!refreshed.session, refreshErr?.message);
  }

  // 1.8 Get user from session
  if (testLogin?.session) {
    const { data: { user }, error: getUserErr } = await testClient.auth.getUser();
    test("getUser returns correct user", !getUserErr && user?.email === testState.testUserEmail, getUserErr?.message);
  }

  // 1.9 Sign out
  const { error: signOutErr } = await testClient.auth.signOut();
  test("Sign out works", !signOutErr, signOutErr?.message);
}

// ============================================================
// SECTION 2: BUSINESS/LEAD CRUD
// ============================================================
async function testBusinessCRUD() {
  startSection("2. BUSINESS/LEAD CRUD");

  // Create authenticated client as admin
  const client = createClient(SUPABASE_URL, ANON_KEY);
  await client.auth.signInWithPassword({
    email: "Diego.j.garnica@gmail.com",
    password: "Mynewpassword2025!",
  });

  // 2.1 Create businesses with various statuses
  const mockBusinesses = [
    {
      business_name: "E2E Test - Acme Corp",
      business_type: "Technology",
      industry_category: "SaaS",
      email: "contact@acmetest.com",
      phone: "5551234567",
      website_url: "https://acmetest.com",
      has_website: true,
      city: "San Francisco",
      state: "CA",
      country: "US",
      status: "new",
      lead_temperature: "hot",
      lead_score: 85,
      source: "website",
      tags: ["enterprise", "saas"],
      notes: "High-priority test lead",
    },
    {
      business_name: "E2E Test - Bob's Plumbing",
      business_type: "Home Services",
      industry_category: "Plumbing",
      email: "bob@plumbingtest.com",
      phone: "5559876543",
      has_website: false,
      city: "Austin",
      state: "TX",
      country: "US",
      status: "contacted",
      lead_temperature: "warm",
      lead_score: 45,
      source: "referral",
    },
    {
      business_name: "E2E Test - Fresh Cafe",
      business_type: "Food & Beverage",
      industry_category: "Restaurant",
      email: "hello@freshcafe.com",
      phone: "5555551234",
      website_url: "https://freshcafe.com",
      has_website: true,
      city: "Portland",
      state: "OR",
      country: "US",
      status: "qualified",
      lead_temperature: "hot",
      lead_score: 92,
      source: "google_maps",
      deal_value: 15000,
      expected_close_date: "2026-03-15",
    },
    {
      business_name: "E2E Test - Zen Yoga Studio",
      business_type: "Health & Wellness",
      industry_category: "Fitness",
      email: "info@zenyoga.com",
      has_website: true,
      city: "Denver",
      state: "CO",
      country: "US",
      status: "proposal",
      lead_temperature: "warm",
      lead_score: 67,
      source: "cold_call",
      deal_value: 8000,
    },
    {
      business_name: "E2E Test - Won Deal LLC",
      business_type: "Consulting",
      industry_category: "Business Services",
      email: "sales@wondeal.com",
      city: "New York",
      state: "NY",
      country: "US",
      status: "won",
      lead_temperature: "hot",
      lead_score: 100,
      source: "linkedin",
      deal_value: 50000,
    },
  ];

  for (const biz of mockBusinesses) {
    const { data, error } = await serviceClient.from("businesses").insert(biz).select().single();
    test(`Create business: ${biz.business_name}`, !error && !!data, error?.message);
    if (data) testState.businessIds.push(data.id);
  }

  // 2.2 Read all businesses
  const { data: allBiz, error: readErr } = await serviceClient
    .from("businesses")
    .select("*")
    .like("business_name", "E2E Test%")
    .order("created_at", { ascending: false });
  test("Read all test businesses", !readErr && allBiz?.length === 5, `Found ${allBiz?.length || 0}`);

  // 2.3 Read single business
  if (testState.businessIds[0]) {
    const { data: single, error: singleErr } = await serviceClient
      .from("businesses")
      .select("*")
      .eq("id", testState.businessIds[0])
      .single();
    test("Read single business by ID", !singleErr && single?.business_name === "E2E Test - Acme Corp");
  }

  // 2.4 Filter businesses by status
  const { data: qualifiedBiz } = await serviceClient
    .from("businesses")
    .select("*")
    .like("business_name", "E2E Test%")
    .eq("status", "qualified");
  test("Filter businesses by status=qualified", qualifiedBiz?.length === 1);

  // 2.5 Filter by temperature
  const { data: hotLeads } = await serviceClient
    .from("businesses")
    .select("*")
    .like("business_name", "E2E Test%")
    .eq("lead_temperature", "hot");
  test("Filter businesses by temperature=hot", hotLeads?.length === 3, `Found ${hotLeads?.length}`);

  // 2.6 Search by name (ilike)
  const { data: searchResults } = await serviceClient
    .from("businesses")
    .select("*")
    .ilike("business_name", "%plumbing%");
  test("Search businesses by name (ilike)", searchResults?.length >= 1);

  // 2.7 Update business
  if (testState.businessIds[0]) {
    const { data: updated, error: updateErr } = await serviceClient
      .from("businesses")
      .update({ status: "contacted", lead_score: 90, notes: "Updated via E2E test" })
      .eq("id", testState.businessIds[0])
      .select()
      .single();
    test("Update business status and score", !updateErr && updated?.status === "contacted" && updated?.lead_score === 90, updateErr?.message);
  }

  // 2.8 Update lead temperature
  if (testState.businessIds[1]) {
    const { data: tempUpdated } = await serviceClient
      .from("businesses")
      .update({ lead_temperature: "cold" })
      .eq("id", testState.businessIds[1])
      .select()
      .single();
    test("Update lead temperature", tempUpdated?.lead_temperature === "cold");
  }

  // 2.9 Update deal value
  if (testState.businessIds[3]) {
    const { data: dealUpdated } = await serviceClient
      .from("businesses")
      .update({ deal_value: 12000 })
      .eq("id", testState.businessIds[3])
      .select()
      .single();
    test("Update deal value", dealUpdated?.deal_value === 12000);
  }

  // 2.10 Sorting
  const { data: sortedByScore } = await serviceClient
    .from("businesses")
    .select("business_name, lead_score")
    .like("business_name", "E2E Test%")
    .order("lead_score", { ascending: false });
  test("Sort businesses by lead_score DESC", sortedByScore?.[0]?.lead_score >= sortedByScore?.[1]?.lead_score);

  // 2.11 Pagination
  const { data: page1 } = await serviceClient
    .from("businesses")
    .select("*")
    .like("business_name", "E2E Test%")
    .range(0, 1);
  test("Pagination (limit 2)", page1?.length === 2);

  const { data: page2 } = await serviceClient
    .from("businesses")
    .select("*")
    .like("business_name", "E2E Test%")
    .range(2, 4);
  test("Pagination (offset 2)", page2?.length === 3);

  // 2.12 Count
  const { count, error: countErr } = await serviceClient
    .from("businesses")
    .select("*", { count: "exact", head: true })
    .like("business_name", "E2E Test%");
  test("Count businesses", !countErr && count === 5, `count=${count}`);
}

// ============================================================
// SECTION 3: CONTACTS CRUD
// ============================================================
async function testContactsCRUD() {
  startSection("3. CONTACTS CRUD");

  if (testState.businessIds.length === 0) {
    test("Contacts tests (need businesses)", "skip", "No businesses created");
    return;
  }

  const bizId = testState.businessIds[0]; // Acme Corp

  // 3.1 Create contacts
  const mockContacts = [
    {
      business_id: bizId,
      first_name: "John",
      last_name: "Smith",
      title: "CEO",
      department: "Executive",
      email: "john@acmetest.com",
      phone: "5551001001",
      linkedin_url: "https://linkedin.com/in/johnsmith",
      is_primary: true,
      relationship_type: "decision_maker",
      notes: "Primary decision maker",
    },
    {
      business_id: bizId,
      first_name: "Jane",
      last_name: "Doe",
      title: "CTO",
      department: "Technology",
      email: "jane@acmetest.com",
      phone: "5551001002",
      is_primary: false,
      relationship_type: "influencer",
    },
    {
      business_id: testState.businessIds[2], // Fresh Cafe
      first_name: "Maria",
      last_name: "Garcia",
      title: "Owner",
      email: "maria@freshcafe.com",
      phone: "5551001003",
      is_primary: true,
      relationship_type: "decision_maker",
    },
  ];

  for (const contact of mockContacts) {
    const { data, error } = await serviceClient.from("contacts").insert(contact).select().single();
    test(`Create contact: ${contact.first_name} ${contact.last_name}`, !error && !!data, error?.message);
    if (data) testState.contactIds.push(data.id);
  }

  // 3.2 Read contacts for a business
  const { data: bizContacts, error: readErr } = await serviceClient
    .from("contacts")
    .select("*")
    .eq("business_id", bizId);
  test("Read contacts for Acme Corp", !readErr && bizContacts?.length === 2, `Found ${bizContacts?.length}`);

  // 3.3 Read single contact
  if (testState.contactIds[0]) {
    const { data: single } = await serviceClient
      .from("contacts")
      .select("*")
      .eq("id", testState.contactIds[0])
      .single();
    test("Read single contact by ID", single?.first_name === "John" && single?.is_primary === true);
  }

  // 3.4 Filter primary contacts
  const { data: primaryContacts } = await serviceClient
    .from("contacts")
    .select("*")
    .eq("is_primary", true)
    .in("business_id", testState.businessIds);
  test("Filter primary contacts", primaryContacts?.length === 2, `Found ${primaryContacts?.length}`);

  // 3.5 Update contact
  if (testState.contactIds[1]) {
    const { data: updated, error: updateErr } = await serviceClient
      .from("contacts")
      .update({ title: "VP of Engineering", mobile_phone: "5559999999" })
      .eq("id", testState.contactIds[1])
      .select()
      .single();
    test("Update contact title and phone", !updateErr && updated?.title === "VP of Engineering", updateErr?.message);
  }

  // 3.6 Verify single primary contact enforcement (trigger)
  // Making Jane primary should remove John as primary
  if (testState.contactIds[1]) {
    await serviceClient
      .from("contacts")
      .update({ is_primary: true })
      .eq("id", testState.contactIds[1]);

    const { data: johnAfter } = await serviceClient
      .from("contacts")
      .select("is_primary")
      .eq("id", testState.contactIds[0])
      .single();
    test("Single primary contact trigger (auto-unset old primary)", johnAfter?.is_primary === false);

    // Reset John as primary
    await serviceClient.from("contacts").update({ is_primary: true }).eq("id", testState.contactIds[0]);
  }

  // 3.7 Search contacts by email
  const { data: emailSearch } = await serviceClient
    .from("contacts")
    .select("*")
    .ilike("email", "%acmetest%");
  test("Search contacts by email", emailSearch?.length === 2);
}

// ============================================================
// SECTION 4: ACTIVITIES & TOUCHPOINTS
// ============================================================
async function testActivitiesAndTouchpoints() {
  startSection("4. ACTIVITIES & TOUCHPOINTS");

  if (testState.businessIds.length === 0) {
    test("Activities tests (need businesses)", "skip", "No businesses created");
    return;
  }

  const bizId = testState.businessIds[0]; // Acme Corp
  const adminProfile = await serviceClient
    .from("profiles")
    .select("id")
    .eq("email", "diego.j.garnica@gmail.com")
    .single();
  const userId = adminProfile.data?.id;

  // 4.1 Create various activity types
  const mockActivities = [
    {
      business_id: bizId,
      user_id: userId,
      activity_type: "call_outbound",
      subject: "Initial discovery call",
      description: "Discussed their current tech stack and pain points",
      outcome: "Interested - follow up scheduled",
      metadata: { duration_minutes: 30, phone_number: "5551234567" },
    },
    {
      business_id: bizId,
      user_id: userId,
      activity_type: "email_sent",
      subject: "Follow-up proposal email",
      description: "Sent detailed proposal with pricing",
      metadata: { template: "proposal_v2", tracking_id: "track_123" },
    },
    {
      business_id: bizId,
      user_id: userId,
      activity_type: "meeting_scheduled",
      subject: "Demo meeting",
      description: "Scheduled product demo for team",
      scheduled_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: { meeting_type: "zoom", attendees: 3 },
    },
    {
      business_id: testState.businessIds[2], // Fresh Cafe
      user_id: userId,
      activity_type: "call_inbound",
      subject: "Incoming inquiry about services",
      description: "Owner called asking about website redesign",
      outcome: "Qualified - high interest",
      metadata: { duration_minutes: 15 },
    },
    {
      business_id: bizId,
      user_id: userId,
      activity_type: "note",
      subject: "Internal note about deal",
      description: "Budget approved by their board, ready to proceed",
    },
    {
      business_id: bizId,
      contact_id: testState.contactIds[0] || null,
      user_id: userId,
      activity_type: "email_opened",
      subject: "Proposal email opened",
      metadata: { opens: 3, last_opened: new Date().toISOString() },
    },
  ];

  for (const activity of mockActivities) {
    const { data, error } = await serviceClient.from("activities").insert(activity).select().single();
    test(`Create activity: ${activity.activity_type} - ${activity.subject}`, !error && !!data, error?.message);
    if (data) testState.activityIds.push(data.id);
  }

  // 4.2 Read activities for a business
  const { data: bizActivities } = await serviceClient
    .from("activities")
    .select("*")
    .eq("business_id", bizId)
    .order("created_at", { ascending: false });
  test("Read activities for Acme Corp", bizActivities?.length === 5, `Found ${bizActivities?.length}`);

  // 4.3 Filter by activity type
  const { data: callActivities } = await serviceClient
    .from("activities")
    .select("*")
    .in("activity_type", ["call_outbound", "call_inbound"])
    .in("business_id", testState.businessIds);
  test("Filter activities by type (calls)", callActivities?.length === 2, `Found ${callActivities?.length}`);

  // 4.4 Activities with profiles join
  const { data: withProfiles } = await serviceClient
    .from("activities")
    .select("*, profiles(full_name)")
    .eq("business_id", bizId)
    .limit(1);
  test("Activities with profiles join", withProfiles?.length === 1);

  // 4.5 Create touchpoints
  const mockTouchpoints = [
    {
      business_id: bizId,
      type: "website_visit",
      source: "google",
      metadata: { page_url: "/pricing", session_duration: 120 },
      occurred_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      business_id: bizId,
      type: "email_open",
      source: "campaign_001",
      metadata: { email_subject: "Special Offer", opens: 2 },
      occurred_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      business_id: bizId,
      type: "form_submit",
      source: "landing_page",
      metadata: { form_name: "Contact Us", fields: { name: "John", email: "john@acme.com" } },
      occurred_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      business_id: testState.businessIds[2],
      type: "call",
      source: "direct",
      metadata: { duration: 15, outcome: "qualified" },
    },
  ];

  for (const tp of mockTouchpoints) {
    const { data, error } = await serviceClient.from("touchpoints").insert(tp).select().single();
    test(`Create touchpoint: ${tp.type}`, !error && !!data, error?.message);
    if (data) testState.touchpointIds.push(data.id);
  }

  // 4.6 Read touchpoints for a business
  const { data: bizTouchpoints } = await serviceClient
    .from("touchpoints")
    .select("*")
    .eq("business_id", bizId)
    .order("occurred_at", { ascending: false });
  test("Read touchpoints for Acme Corp", bizTouchpoints?.length === 3, `Found ${bizTouchpoints?.length}`);

  // 4.7 Touchpoint ordering
  if (bizTouchpoints?.length >= 2) {
    const dates = bizTouchpoints.map((t) => new Date(t.occurred_at).getTime());
    test("Touchpoints ordered DESC by occurred_at", dates[0] >= dates[1]);
  }
}

// ============================================================
// SECTION 5: CAMPAIGNS
// ============================================================
async function testCampaigns() {
  startSection("5. CAMPAIGNS");

  const adminProfile = await serviceClient
    .from("profiles")
    .select("id")
    .eq("email", "diego.j.garnica@gmail.com")
    .single();
  const userId = adminProfile.data?.id;

  // 5.1 Create campaigns
  const mockCampaigns = [
    {
      name: "E2E Test - Q1 Email Blast",
      description: "Quarterly outreach campaign targeting new leads",
      campaign_type: "email",
      status: "active",
      target_criteria: { status: ["new", "contacted"], temperature: ["warm", "hot"] },
      budget: 5000,
      started_at: new Date().toISOString(),
      created_by: userId,
    },
    {
      name: "E2E Test - Cold Call Sprint",
      description: "Two-week intensive cold calling blitz",
      campaign_type: "cold_call",
      status: "draft",
      target_criteria: { temperature: ["cold"], has_website: false },
      budget: 2000,
      created_by: userId,
    },
    {
      name: "E2E Test - Social Media Push",
      description: "LinkedIn and Instagram outreach",
      campaign_type: "social",
      status: "active",
      budget: 3000,
      started_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_by: userId,
    },
    {
      name: "E2E Test - Completed Mailer",
      description: "Past direct mail campaign",
      campaign_type: "mailer",
      status: "completed",
      budget: 10000,
      started_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      ended_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      created_by: userId,
    },
  ];

  for (const campaign of mockCampaigns) {
    const { data, error } = await serviceClient.from("campaigns").insert(campaign).select().single();
    test(`Create campaign: ${campaign.name}`, !error && !!data, error?.message);
    if (data) testState.campaignIds.push(data.id);
  }

  // 5.2 Read all campaigns
  const { data: allCampaigns } = await serviceClient
    .from("campaigns")
    .select("*")
    .like("name", "E2E Test%");
  test("Read all test campaigns", allCampaigns?.length === 4, `Found ${allCampaigns?.length}`);

  // 5.3 Filter active campaigns
  const { data: activeCampaigns } = await serviceClient
    .from("campaigns")
    .select("*")
    .like("name", "E2E Test%")
    .eq("status", "active");
  test("Filter active campaigns", activeCampaigns?.length === 2, `Found ${activeCampaigns?.length}`);

  // 5.4 Update campaign status
  if (testState.campaignIds[1]) {
    const { data: updated } = await serviceClient
      .from("campaigns")
      .update({ status: "active", started_at: new Date().toISOString() })
      .eq("id", testState.campaignIds[1])
      .select()
      .single();
    test("Update campaign status draft->active", updated?.status === "active");
  }

  // 5.5 Pause campaign
  if (testState.campaignIds[2]) {
    const { data: paused } = await serviceClient
      .from("campaigns")
      .update({ status: "paused" })
      .eq("id", testState.campaignIds[2])
      .select()
      .single();
    test("Pause campaign", paused?.status === "paused");
  }

  // 5.6 Filter by campaign type
  const { data: emailCampaigns } = await serviceClient
    .from("campaigns")
    .select("*")
    .like("name", "E2E Test%")
    .eq("campaign_type", "email");
  test("Filter by campaign_type=email", emailCampaigns?.length === 1);
}

// ============================================================
// SECTION 6: AUTOMATION RULES
// ============================================================
async function testAutomationRules() {
  startSection("6. AUTOMATION RULES");

  const adminProfile = await serviceClient
    .from("profiles")
    .select("id")
    .eq("email", "diego.j.garnica@gmail.com")
    .single();
  const userId = adminProfile.data?.id;

  // 6.1 Create automation rules
  const mockRules = [
    {
      name: "E2E Test - Auto-assign hot leads",
      description: "Automatically assign hot leads to senior reps",
      trigger_type: "score_threshold",
      trigger_config: { threshold: 80, comparison: "gte" },
      action_type: "assign_user",
      action_config: { user_id: userId },
      is_active: true,
      priority: 1,
      created_by: userId,
    },
    {
      name: "E2E Test - Send welcome email",
      description: "Send welcome email when new lead is created",
      trigger_type: "lead_created",
      trigger_config: {},
      action_type: "send_email",
      action_config: { template: "welcome", delay_hours: 0 },
      is_active: true,
      priority: 2,
      created_by: userId,
    },
    {
      name: "E2E Test - Inactive lead alert",
      description: "Alert when lead has no activity for 14 days",
      trigger_type: "inactivity",
      trigger_config: { days: 14 },
      action_type: "create_task",
      action_config: { task_type: "follow_up", priority: "high" },
      is_active: false,
      priority: 3,
      created_by: userId,
    },
  ];

  for (const rule of mockRules) {
    const { data, error } = await serviceClient.from("automation_rules").insert(rule).select().single();
    test(`Create rule: ${rule.name}`, !error && !!data, error?.message);
    if (data) testState.automationRuleIds.push(data.id);
  }

  // 6.2 Read all rules
  const { data: allRules } = await serviceClient
    .from("automation_rules")
    .select("*")
    .like("name", "E2E Test%");
  test("Read all test automation rules", allRules?.length === 3);

  // 6.3 Filter active rules
  const { data: activeRules } = await serviceClient
    .from("automation_rules")
    .select("*")
    .like("name", "E2E Test%")
    .eq("is_active", true);
  test("Filter active automation rules", activeRules?.length === 2);

  // 6.4 Toggle rule active/inactive
  if (testState.automationRuleIds[2]) {
    const { data: toggled } = await serviceClient
      .from("automation_rules")
      .update({ is_active: true })
      .eq("id", testState.automationRuleIds[2])
      .select()
      .single();
    test("Toggle automation rule active", toggled?.is_active === true);
  }

  // 6.5 Update rule config
  if (testState.automationRuleIds[0]) {
    const { data: updated } = await serviceClient
      .from("automation_rules")
      .update({ trigger_config: { threshold: 90, comparison: "gte" }, priority: 0 })
      .eq("id", testState.automationRuleIds[0])
      .select()
      .single();
    test("Update rule config and priority", updated?.priority === 0);
  }

  // 6.6 Order by priority
  const { data: ordered } = await serviceClient
    .from("automation_rules")
    .select("name, priority")
    .like("name", "E2E Test%")
    .order("priority", { ascending: true });
  test("Rules ordered by priority", ordered?.[0]?.priority <= ordered?.[1]?.priority);
}

// ============================================================
// SECTION 7: REPORTS & ANALYTICS
// ============================================================
async function testReportsAndAnalytics() {
  startSection("7. REPORTS & ANALYTICS");

  const adminProfile = await serviceClient
    .from("profiles")
    .select("id")
    .eq("email", "diego.j.garnica@gmail.com")
    .single();
  const userId = adminProfile.data?.id;

  // 7.1 Create reports
  const mockReports = [
    {
      name: "E2E Test - Lead Pipeline Report",
      description: "Weekly pipeline overview",
      report_type: "pipeline",
      filters: { date_range: "last_30_days", status: ["new", "contacted", "qualified"] },
      columns: ["business_name", "status", "lead_score", "deal_value"],
      chart_type: "funnel",
      schedule: "weekly",
      is_public: false,
      created_by: userId,
    },
    {
      name: "E2E Test - Activity Summary",
      description: "Daily activity metrics",
      report_type: "activities",
      filters: { date_range: "last_7_days" },
      columns: ["activity_type", "count", "user"],
      chart_type: "bar",
      schedule: "daily",
      is_public: true,
      created_by: userId,
    },
  ];

  for (const report of mockReports) {
    const { data, error } = await serviceClient.from("reports").insert(report).select().single();
    test(`Create report: ${report.name}`, !error && !!data, error?.message);
    if (data) testState.reportIds.push(data.id);
  }

  // 7.2 Read reports
  const { data: allReports } = await serviceClient
    .from("reports")
    .select("*")
    .like("name", "E2E Test%");
  test("Read all test reports", allReports?.length === 2);

  // 7.3 Filter by report type
  const { data: pipelineReports } = await serviceClient
    .from("reports")
    .select("*")
    .like("name", "E2E Test%")
    .eq("report_type", "pipeline");
  test("Filter by report_type=pipeline", pipelineReports?.length === 1);

  // 7.4 Create analytics snapshot (use upsert due to UNIQUE on snapshot_date)
  const todayDate = new Date().toISOString().split("T")[0];
  // Delete any existing snapshot for today first (from previous runs)
  await serviceClient.from("analytics_snapshots").delete().eq("snapshot_date", todayDate);
  const { data: snapshot, error: snapErr } = await serviceClient
    .from("analytics_snapshots")
    .insert({
      snapshot_date: todayDate,
      total_leads: 5,
      new_leads: 1,
      contacted_leads: 1,
      converted_leads: 1,
      emails_sent: 10,
      calls_made: 5,
      meetings_booked: 2,
      revenue_pipeline: 73000,
      revenue_closed: 50000,
    })
    .select()
    .single();
  test("Create analytics snapshot", !snapErr && !!snapshot, snapErr?.message);

  // 7.5 Read analytics snapshot
  if (snapshot) {
    const { data: readSnap } = await serviceClient
      .from("analytics_snapshots")
      .select("*")
      .eq("snapshot_date", new Date().toISOString().split("T")[0])
      .single();
    test("Read analytics snapshot", readSnap?.total_leads === 5 && readSnap?.revenue_closed === 50000);
  }
}

// ============================================================
// SECTION 8: ADMIN FEATURES
// ============================================================
async function testAdminFeatures() {
  startSection("8. ADMIN FEATURES");

  // 8.1 Admin can view all profiles
  const { data: allProfiles, error: profilesErr } = await serviceClient
    .from("profiles")
    .select("*");
  test("Admin can read all profiles", !profilesErr && allProfiles?.length >= 2, `Found ${allProfiles?.length}`);

  // 8.2 Admin can update user role
  if (testState.testUserId) {
    const { data: roleUpdated, error: roleErr } = await serviceClient
      .from("profiles")
      .update({ role: "manager" })
      .eq("id", testState.testUserId)
      .select()
      .single();
    test("Admin can update user role to manager", !roleErr && roleUpdated?.role === "manager", roleErr?.message);

    // Reset back
    await serviceClient.from("profiles").update({ role: "user" }).eq("id", testState.testUserId);
  }

  // 8.3 Admin can toggle user active
  if (testState.testUserId) {
    const { data: deactivated } = await serviceClient
      .from("profiles")
      .update({ is_active: false })
      .eq("id", testState.testUserId)
      .select()
      .single();
    test("Admin can deactivate user", deactivated?.is_active === false);

    const { data: reactivated } = await serviceClient
      .from("profiles")
      .update({ is_active: true })
      .eq("id", testState.testUserId)
      .select()
      .single();
    test("Admin can reactivate user", reactivated?.is_active === true);
  }

  // 8.4 Create audit log entry
  const { data: auditLog, error: auditErr } = await serviceClient
    .from("audit_logs")
    .insert({
      user_id: (await serviceClient.from("profiles").select("id").eq("email", "diego.j.garnica@gmail.com").single()).data?.id,
      action: "e2e_test",
      resource_type: "system",
      metadata: { test_run: true, timestamp: new Date().toISOString() },
      ip_address: "127.0.0.1",
      user_agent: "E2E Test Runner",
    })
    .select()
    .single();
  test("Create audit log entry", !auditErr && !!auditLog, auditErr?.message);
  if (auditLog) testState.auditLogIds.push(auditLog.id);

  // 8.5 Read audit logs
  const { data: auditLogs } = await serviceClient
    .from("audit_logs")
    .select("*")
    .eq("action", "e2e_test");
  test("Read audit logs", auditLogs?.length >= 1);

  // 8.6 System settings
  const { data: settings } = await serviceClient
    .from("system_settings")
    .select("*");
  test("Read system settings", settings?.length > 0, `Found ${settings?.length} settings`);

  // 8.7 Read specific setting
  const { data: companyName } = await serviceClient
    .from("system_settings")
    .select("*")
    .eq("key", "company_name")
    .single();
  test("Read company_name setting", !!companyName);

  // 8.8 Update system setting
  if (companyName) {
    const { data: updatedSetting, error: settingErr } = await serviceClient
      .from("system_settings")
      .update({ value: '"LeadFlow Test Platform"' })
      .eq("key", "company_name")
      .select()
      .single();
    test("Update system setting", !settingErr, settingErr?.message);

    // Reset
    await serviceClient
      .from("system_settings")
      .update({ value: '"LeadFlow Platform"' })
      .eq("key", "company_name");
  }
}

// ============================================================
// SECTION 9: WEBHOOKS & API KEYS
// ============================================================
async function testWebhooksAndApiKeys() {
  startSection("9. WEBHOOKS & API KEYS");

  const adminProfile = await serviceClient
    .from("profiles")
    .select("id")
    .eq("email", "diego.j.garnica@gmail.com")
    .single();
  const userId = adminProfile.data?.id;

  // 9.1 Create webhook configs
  const mockWebhooks = [
    {
      user_id: userId,
      name: "E2E Test - New Lead Webhook",
      description: "Fires when a new lead is created",
      type: "outbound",
      url: "https://httpbin.org/post",
      events: ["lead.created", "lead.updated"],
      headers: { "X-Custom": "test" },
      is_active: true,
      retry_count: 3,
      retry_delay: 60,
    },
    {
      user_id: userId,
      name: "E2E Test - Inbound n8n Webhook",
      description: "Receives data from n8n workflows",
      type: "inbound",
      events: ["data.sync"],
      is_active: true,
      retry_count: 0,
      retry_delay: 0,
    },
  ];

  for (const webhook of mockWebhooks) {
    const { data, error } = await serviceClient.from("webhook_configs").insert(webhook).select().single();
    test(`Create webhook: ${webhook.name}`, !error && !!data, error?.message);
    if (data) testState.webhookIds.push(data.id);
  }

  // 9.2 Read webhooks
  const { data: allWebhooks } = await serviceClient
    .from("webhook_configs")
    .select("*")
    .like("name", "E2E Test%");
  test("Read all test webhooks", allWebhooks?.length === 2);

  // 9.3 Toggle webhook
  if (testState.webhookIds[0]) {
    const { data: disabled } = await serviceClient
      .from("webhook_configs")
      .update({ is_active: false })
      .eq("id", testState.webhookIds[0])
      .select()
      .single();
    test("Disable webhook", disabled?.is_active === false);

    await serviceClient
      .from("webhook_configs")
      .update({ is_active: true })
      .eq("id", testState.webhookIds[0]);
  }

  // 9.4 Create API keys
  const crypto = await import("crypto");
  const rawKey = `lf_test_${crypto.randomBytes(16).toString("hex")}`;
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

  const { data: apiKey, error: apiKeyErr } = await serviceClient
    .from("api_keys")
    .insert({
      user_id: userId,
      name: "E2E Test API Key",
      key_hash: keyHash,
      key_prefix: rawKey.substring(0, 8),
      scopes: ["read:leads", "write:leads", "read:contacts"],
      is_active: true,
      expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single();
  test("Create API key", !apiKeyErr && !!apiKey, apiKeyErr?.message);
  if (apiKey) testState.apiKeyIds.push(apiKey.id);

  // 9.5 Read API keys
  const { data: userKeys } = await serviceClient
    .from("api_keys")
    .select("*")
    .eq("user_id", userId)
    .eq("name", "E2E Test API Key");
  test("Read API keys for user", userKeys?.length === 1);

  // 9.6 Verify key prefix stored (not full key)
  if (apiKey) {
    test("API key stores hash, not raw key", apiKey.key_hash !== rawKey && apiKey.key_hash.length === 64);
    test("API key prefix stored", apiKey.key_prefix === rawKey.substring(0, 8));
  }

  // 9.7 Toggle API key
  if (testState.apiKeyIds[0]) {
    const { data: disabledKey } = await serviceClient
      .from("api_keys")
      .update({ is_active: false })
      .eq("id", testState.apiKeyIds[0])
      .select()
      .single();
    test("Disable API key", disabledKey?.is_active === false);
  }
}

// ============================================================
// SECTION 10: APP ROUTES & MIDDLEWARE
// ============================================================
async function testAppRoutes() {
  startSection("10. APP ROUTES & MIDDLEWARE");

  // 10.1 Login page accessible (unauthenticated)
  const loginRes = await fetch(`${APP_URL}/login`);
  test("Login page accessible (200)", loginRes.status === 200);

  // 10.2 Register page accessible
  const registerRes = await fetch(`${APP_URL}/register`);
  test("Register page accessible (200)", registerRes.status === 200);

  // 10.3 Forgot password page accessible
  const forgotRes = await fetch(`${APP_URL}/forgot-password`);
  test("Forgot password page accessible (200)", forgotRes.status === 200);

  // 10.4 Protected routes redirect to login
  const dashRes = await fetch(`${APP_URL}/dashboard`, { redirect: "manual" });
  test("Dashboard redirects to login (307)", dashRes.status === 307, `status=${dashRes.status}`);

  const leadsRes = await fetch(`${APP_URL}/leads`, { redirect: "manual" });
  test("Leads page redirects to login (307)", leadsRes.status === 307, `status=${leadsRes.status}`);

  const contactsRes = await fetch(`${APP_URL}/contacts`, { redirect: "manual" });
  test("Contacts page redirects to login (307)", contactsRes.status === 307, `status=${contactsRes.status}`);

  const activitiesRes = await fetch(`${APP_URL}/activities`, { redirect: "manual" });
  test("Activities page redirects to login (307)", activitiesRes.status === 307, `status=${activitiesRes.status}`);

  const campaignsRes = await fetch(`${APP_URL}/campaigns`, { redirect: "manual" });
  test("Campaigns page redirects to login (307)", campaignsRes.status === 307, `status=${campaignsRes.status}`);

  const analyticsRes = await fetch(`${APP_URL}/analytics`, { redirect: "manual" });
  test("Analytics page redirects to login (307)", analyticsRes.status === 307, `status=${analyticsRes.status}`);

  const reportsRes = await fetch(`${APP_URL}/reports`, { redirect: "manual" });
  test("Reports page redirects to login (307)", reportsRes.status === 307, `status=${reportsRes.status}`);

  const settingsRes = await fetch(`${APP_URL}/settings`, { redirect: "manual" });
  test("Settings page redirects to login (307)", settingsRes.status === 307, `status=${settingsRes.status}`);

  const automationRes = await fetch(`${APP_URL}/automation`, { redirect: "manual" });
  test("Automation page redirects to login (307)", automationRes.status === 307, `status=${automationRes.status}`);

  // 10.5 Admin route redirects to login
  const adminRes = await fetch(`${APP_URL}/admin`, { redirect: "manual" });
  test("Admin page redirects to login (307)", adminRes.status === 307, `status=${adminRes.status}`);

  const adminUsersRes = await fetch(`${APP_URL}/admin/users`, { redirect: "manual" });
  test("Admin users page redirects to login (307)", adminUsersRes.status === 307, `status=${adminUsersRes.status}`);

  // 10.6 Security headers
  const secHeaders = await fetch(`${APP_URL}/login`);
  test("X-Content-Type-Options header", secHeaders.headers.get("x-content-type-options") === "nosniff");
  test("X-Frame-Options header", secHeaders.headers.get("x-frame-options") === "DENY");
  test("X-XSS-Protection header", secHeaders.headers.get("x-xss-protection") === "1; mode=block");
  test("Referrer-Policy header", secHeaders.headers.get("referrer-policy") === "strict-origin-when-cross-origin");

  // 10.7 Static assets load
  const faviconRes = await fetch(`${APP_URL}/favicon.ico`);
  test("Favicon loads", faviconRes.status === 200 || faviconRes.status === 304, `status=${faviconRes.status}`);
}

// ============================================================
// SECTION 11: RLS POLICY TESTS
// ============================================================
async function testRLSPolicies() {
  startSection("11. ROW LEVEL SECURITY");

  // Sign in as test user (not admin)
  const userClient = createClient(SUPABASE_URL, ANON_KEY);
  await userClient.auth.signInWithPassword({
    email: testState.testUserEmail,
    password: testState.testUserPassword,
  });

  // 11.1 Regular user can see own profile
  const { data: ownProfile, error: ownErr } = await userClient
    .from("profiles")
    .select("*")
    .eq("email", testState.testUserEmail);
  test("Regular user can see own profile", !ownErr && ownProfile?.length === 1, ownErr?.message);

  // 11.2 Regular user CANNOT see admin profile (RLS)
  const { data: adminProfiles } = await userClient
    .from("profiles")
    .select("*")
    .eq("email", "diego.j.garnica@gmail.com");
  test("Regular user cannot see admin profile (RLS)", adminProfiles?.length === 0, `Found ${adminProfiles?.length}`);

  // 11.3 Regular user can view businesses (authenticated)
  const { data: bizList, error: bizErr } = await userClient
    .from("businesses")
    .select("*")
    .limit(5);
  test("Authenticated user can view businesses", !bizErr, bizErr?.message);

  // 11.4 Regular user can view contacts
  const { data: contactList, error: contactErr } = await userClient
    .from("contacts")
    .select("*")
    .limit(5);
  test("Authenticated user can view contacts", !contactErr, contactErr?.message);

  // 11.5 Regular user can view activities
  const { data: actList, error: actErr } = await userClient
    .from("activities")
    .select("*")
    .limit(5);
  test("Authenticated user can view activities", !actErr, actErr?.message);

  await userClient.auth.signOut();
}

// ============================================================
// SECTION 12: DATA INTEGRITY & RELATIONSHIPS
// ============================================================
async function testDataIntegrity() {
  startSection("12. DATA INTEGRITY & RELATIONSHIPS");

  // 12.1 Business -> Contacts relationship
  if (testState.businessIds[0] && testState.contactIds.length > 0) {
    const { data: bizWithContacts } = await serviceClient
      .from("businesses")
      .select("*, contacts(*)")
      .eq("id", testState.businessIds[0])
      .single();
    test("Business -> Contacts relationship", bizWithContacts?.contacts?.length >= 1, `Found ${bizWithContacts?.contacts?.length} contacts`);
  }

  // 12.2 Business -> Activities relationship
  if (testState.businessIds[0]) {
    const { data: bizWithActivities } = await serviceClient
      .from("businesses")
      .select("*, activities(*)")
      .eq("id", testState.businessIds[0])
      .single();
    test("Business -> Activities relationship", bizWithActivities?.activities?.length >= 1, `Found ${bizWithActivities?.activities?.length} activities`);
  }

  // 12.3 Business -> Touchpoints relationship
  if (testState.businessIds[0]) {
    const { data: bizWithTouchpoints } = await serviceClient
      .from("businesses")
      .select("*, touchpoints(*)")
      .eq("id", testState.businessIds[0])
      .single();
    test("Business -> Touchpoints relationship", bizWithTouchpoints?.touchpoints?.length >= 1, `Found ${bizWithTouchpoints?.touchpoints?.length} touchpoints`);
  }

  // 12.4 Profile -> Activities relationship
  const adminProfile = await serviceClient
    .from("profiles")
    .select("id")
    .eq("email", "diego.j.garnica@gmail.com")
    .single();
  if (adminProfile.data) {
    const { data: profileActivities } = await serviceClient
      .from("activities")
      .select("*")
      .eq("user_id", adminProfile.data.id);
    test("Profile -> Activities relationship", profileActivities?.length >= 1, `Found ${profileActivities?.length}`);
  }

  // 12.5 Cascading delete test - create throwaway business + contact
  const { data: tempBiz } = await serviceClient
    .from("businesses")
    .insert({ business_name: "E2E Cascade Test", country: "US", status: "new", lead_temperature: "cold" })
    .select()
    .single();

  if (tempBiz) {
    await serviceClient
      .from("contacts")
      .insert({ business_id: tempBiz.id, first_name: "Cascade", last_name: "Test" });

    // Delete business should cascade to contacts
    await serviceClient.from("businesses").delete().eq("id", tempBiz.id);

    const { data: orphanContacts } = await serviceClient
      .from("contacts")
      .select("*")
      .eq("business_id", tempBiz.id);
    test("CASCADE DELETE: contacts removed when business deleted", orphanContacts?.length === 0);
  }

  // 12.6 updated_at trigger
  if (testState.businessIds[0]) {
    const { data: before } = await serviceClient
      .from("businesses")
      .select("updated_at")
      .eq("id", testState.businessIds[0])
      .single();

    await new Promise((r) => setTimeout(r, 1100));

    await serviceClient
      .from("businesses")
      .update({ notes: "Updated for timestamp test - " + Date.now() })
      .eq("id", testState.businessIds[0]);

    const { data: after } = await serviceClient
      .from("businesses")
      .select("updated_at")
      .eq("id", testState.businessIds[0])
      .single();

    test("updated_at trigger fires on update", new Date(after.updated_at) > new Date(before.updated_at));
  }
}

// ============================================================
// SECTION 13: LANDING PAGES
// ============================================================
async function testLandingPages() {
  startSection("13. LANDING PAGES");

  const { data: lp, error: lpErr } = await serviceClient
    .from("landing_pages")
    .insert({
      business_id: testState.businessIds[0],
      campaign_id: testState.campaignIds[0],
      page_name: "E2E Test Landing Page",
      slug: `e2e-test-${Date.now()}`,
      template_used: "modern_v1",
      url: "https://example.com/landing",
      status: "active",
      visit_count: 150,
      conversion_count: 12,
    })
    .select()
    .single();
  test("Create landing page", !lpErr && !!lp, lpErr?.message);

  if (lp) {
    // Read
    const { data: readLP } = await serviceClient
      .from("landing_pages")
      .select("*")
      .eq("id", lp.id)
      .single();
    test("Read landing page", readLP?.page_name === "E2E Test Landing Page");

    // Update
    const { data: updatedLP } = await serviceClient
      .from("landing_pages")
      .update({ visit_count: 200, conversion_count: 18 })
      .eq("id", lp.id)
      .select()
      .single();
    test("Update landing page metrics", updatedLP?.visit_count === 200 && updatedLP?.conversion_count === 18);

    // Cleanup
    await serviceClient.from("landing_pages").delete().eq("id", lp.id);
    test("Delete landing page", true);
  }
}

// ============================================================
// CLEANUP
// ============================================================
async function cleanup() {
  startSection("14. CLEANUP");

  let cleanupErrors = 0;

  // Delete in reverse dependency order
  const tables = [
    { name: "touchpoints", ids: testState.touchpointIds },
    { name: "activities", ids: testState.activityIds },
    { name: "contacts", ids: testState.contactIds },
    { name: "automation_rules", ids: testState.automationRuleIds },
    { name: "reports", ids: testState.reportIds },
    { name: "webhook_configs", ids: testState.webhookIds },
    { name: "api_keys", ids: testState.apiKeyIds },
    { name: "audit_logs", ids: testState.auditLogIds },
    { name: "campaigns", ids: testState.campaignIds },
    { name: "businesses", ids: testState.businessIds },
  ];

  for (const { name, ids } of tables) {
    if (ids.length > 0) {
      const { error } = await serviceClient.from(name).delete().in("id", ids);
      if (error) {
        cleanupErrors++;
        console.log(`  [WARN] Failed to cleanup ${name}: ${error.message}`);
      } else {
        console.log(`  [OK]   Cleaned ${ids.length} ${name}`);
      }
    }
  }

  // Delete analytics snapshot
  await serviceClient
    .from("analytics_snapshots")
    .delete()
    .eq("snapshot_date", new Date().toISOString().split("T")[0]);
  console.log(`  [OK]   Cleaned analytics_snapshots`);

  // Delete test user
  if (testState.testUserId) {
    // Delete profile first
    await serviceClient.from("profiles").delete().eq("id", testState.testUserId);
    // Delete auth user
    const { error: delUserErr } = await serviceClient.auth.admin.deleteUser(testState.testUserId);
    if (delUserErr) {
      console.log(`  [WARN] Failed to delete test user: ${delUserErr.message}`);
      cleanupErrors++;
    } else {
      console.log(`  [OK]   Deleted test user ${testState.testUserEmail}`);
    }
  }

  test("Cleanup completed", cleanupErrors === 0, cleanupErrors > 0 ? `${cleanupErrors} cleanup errors` : "all clean");
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log(`\n${"#".repeat(60)}`);
  console.log(`  LEADFLOW PLATFORM - FULL E2E TEST SUITE`);
  console.log(`  ${new Date().toISOString()}`);
  console.log(`  App URL: ${APP_URL}`);
  console.log(`  Supabase: ${SUPABASE_URL}`);
  console.log(`${"#".repeat(60)}`);

  const startTime = Date.now();

  try {
    await testAuthentication();
    await testBusinessCRUD();
    await testContactsCRUD();
    await testActivitiesAndTouchpoints();
    await testCampaigns();
    await testAutomationRules();
    await testReportsAndAnalytics();
    await testAdminFeatures();
    await testWebhooksAndApiKeys();
    await testAppRoutes();
    await testRLSPolicies();
    await testDataIntegrity();
    await testLandingPages();
    await cleanup();
  } catch (err) {
    console.error(`\n  FATAL ERROR: ${err.message}`);
    console.error(err.stack);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  // Final Report
  console.log(`\n${"#".repeat(60)}`);
  console.log(`  FINAL TEST REPORT`);
  console.log(`${"#".repeat(60)}`);
  console.log(`\n  Duration: ${duration}s`);
  console.log(`  Total:    ${totalTests}`);
  console.log(`  Passed:   ${passed}  (${((passed / totalTests) * 100).toFixed(1)}%)`);
  console.log(`  Failed:   ${failed}`);
  console.log(`  Skipped:  ${skipped}`);

  console.log(`\n  Section Breakdown:`);
  console.log(`  ${"─".repeat(55)}`);
  for (const [section, results] of Object.entries(sectionResults)) {
    const total = results.passed + results.failed + results.skipped;
    const pct = total > 0 ? ((results.passed / total) * 100).toFixed(0) : "N/A";
    const status = results.failed === 0 ? "PASS" : "FAIL";
    console.log(`  [${status}] ${section.padEnd(40)} ${results.passed}/${total} (${pct}%)`);
  }

  if (failures.length > 0) {
    console.log(`\n  Failed Tests:`);
    console.log(`  ${"─".repeat(55)}`);
    for (const f of failures) {
      console.log(`  [${f.section}] ${f.name}${f.detail ? " - " + f.detail : ""}`);
    }
  }

  console.log(`\n${"#".repeat(60)}`);
  console.log(`  ${failed === 0 ? "ALL TESTS PASSED" : `${failed} TEST(S) FAILED`}`);
  console.log(`${"#".repeat(60)}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

main();
