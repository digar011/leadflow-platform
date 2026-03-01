import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { ApiErrors, handleApiError } from "@/lib/utils/api-errors";

// Use direct createClient with service role (no cookies needed for writes)
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(_request: NextRequest) {
  try {
    // Verify the user is authenticated
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return ApiErrors.unauthorized();
    }

    const userId = user.id;
    const userEmail = user.email;
    const service = getServiceClient();

    // Step 1: Set user to admin + enterprise tier
    const { error: profileError } = await service
      .from("profiles")
      .update({
        role: "admin",
        subscription_tier: "enterprise",
        subscription_billing_cycle: "annual",
        is_active: true,
        full_name: user.user_metadata?.full_name || userEmail?.split("@")[0] || "Admin User",
      })
      .eq("id", userId);

    if (profileError) {
      return handleApiError(profileError, { route: "/api/admin/seed", action: "update_profile" });
    }

    // Step 2: Check if seed data already exists
    const { count } = await service
      .from("businesses")
      .select("*", { count: "exact", head: true })
      .eq("assigned_to", userId);

    if ((count || 0) >= 10) {
      return NextResponse.json({
        message: "Seed data already exists",
        profile: "admin + enterprise",
        businesses: count,
      });
    }

    // Step 3: Insert 10 businesses
    const businesses = [
      { business_name: "Acme Corp", business_type: "LLC", industry_category: "Technology", phone: "(555) 100-1001", email: "info@acmecorp.com", website_url: "https://acmecorp.com", has_website: true, street_address: "123 Main St", city: "San Francisco", state: "CA", zip_code: "94102", country: "US", lead_score: 85, lead_temperature: "hot", status: "qualified", source: "website", deal_value: 125000, expected_close_date: getFutureDate(30), next_follow_up: getFutureDate(2), tags: ["enterprise", "saas"], notes: "Key enterprise prospect. Met at SaaStr conference.", assigned_to: userId, created_at: getPastDate(45) },
      { business_name: "TechStart Inc", business_type: "Corporation", industry_category: "SaaS", phone: "(555) 200-2002", email: "hello@techstart.io", website_url: "https://techstart.io", has_website: true, street_address: "456 Innovation Blvd", city: "Austin", state: "TX", zip_code: "78701", country: "US", lead_score: 72, lead_temperature: "warm", status: "proposal", source: "referral", deal_value: 45000, expected_close_date: getFutureDate(14), next_follow_up: getFutureDate(1), tags: ["startup", "series-a"], notes: "Referred by John at Acme. Needs CRM integration.", assigned_to: userId, created_at: getPastDate(30) },
      { business_name: "GreenLeaf Organics", business_type: "LLC", industry_category: "Food & Beverage", phone: "(555) 300-3003", email: "orders@greenleaf.com", website_url: "https://greenleaf.com", has_website: true, street_address: "789 Farm Rd", city: "Portland", state: "OR", zip_code: "97201", country: "US", lead_score: 60, lead_temperature: "warm", status: "contacted", source: "cold_call", deal_value: 18000, expected_close_date: getFutureDate(60), next_follow_up: getFutureDate(5), tags: ["organic", "retail"], notes: "Interested in our marketing automation module.", assigned_to: userId, created_at: getPastDate(20) },
      { business_name: "BuildRight Construction", business_type: "Corporation", industry_category: "Construction", phone: "(555) 400-4004", email: "bids@buildright.co", website_url: "https://buildright.co", has_website: true, street_address: "321 Steel Ave", city: "Denver", state: "CO", zip_code: "80202", country: "US", lead_score: 90, lead_temperature: "hot", status: "negotiation", source: "linkedin", deal_value: 250000, expected_close_date: getFutureDate(7), next_follow_up: getFutureDate(1), tags: ["construction", "enterprise"], notes: "Final contract review. Legal team involved.", assigned_to: userId, created_at: getPastDate(60) },
      { business_name: "Pixel Perfect Design", business_type: "Sole Proprietorship", industry_category: "Design", phone: "(555) 500-5005", email: "studio@pixelperfect.design", website_url: null, has_website: false, street_address: "555 Creative St", city: "Brooklyn", state: "NY", zip_code: "11201", country: "US", lead_score: 35, lead_temperature: "cold", status: "new", source: "import", deal_value: 5000, expected_close_date: null, next_follow_up: getFutureDate(7), tags: ["design", "freelance"], notes: "Small agency, exploring CRM options.", assigned_to: userId, created_at: getPastDate(3) },
      { business_name: "CloudNine Solutions", business_type: "LLC", industry_category: "Cloud Services", phone: "(555) 600-6006", email: "sales@cloudnine.io", website_url: "https://cloudnine.io", has_website: true, street_address: "999 Cloud Way", city: "Seattle", state: "WA", zip_code: "98101", country: "US", lead_score: 78, lead_temperature: "hot", status: "won", source: "partner", deal_value: 75000, expected_close_date: getPastDate(5), next_follow_up: null, tags: ["cloud", "partner"], notes: "Deal closed! Onboarding scheduled for next week.", assigned_to: userId, created_at: getPastDate(90) },
      { business_name: "MediCare Plus", business_type: "Corporation", industry_category: "Healthcare", phone: "(555) 700-7007", email: "admin@medicareplus.org", website_url: "https://medicareplus.org", has_website: true, street_address: "777 Health Pkwy", city: "Chicago", state: "IL", zip_code: "60601", country: "US", lead_score: 65, lead_temperature: "warm", status: "qualified", source: "webinar", deal_value: 95000, expected_close_date: getFutureDate(45), next_follow_up: getFutureDate(3), tags: ["healthcare", "hipaa"], notes: "Needs HIPAA-compliant solution. Demo scheduled.", assigned_to: userId, created_at: getPastDate(15) },
      { business_name: "EduLearn Academy", business_type: "Non-Profit", industry_category: "Education", phone: "(555) 800-8008", email: "info@edulearn.edu", website_url: "https://edulearn.edu", has_website: true, street_address: "888 Campus Dr", city: "Boston", state: "MA", zip_code: "02101", country: "US", lead_score: 45, lead_temperature: "cold", status: "contacted", source: "event", deal_value: 12000, expected_close_date: getFutureDate(90), next_follow_up: getFutureDate(14), tags: ["education", "non-profit"], notes: "Met at EdTech conference. Budget limited.", assigned_to: userId, created_at: getPastDate(10) },
      { business_name: "FastFreight Logistics", business_type: "LLC", industry_category: "Logistics", phone: "(555) 900-9009", email: "ops@fastfreight.com", website_url: "https://fastfreight.com", has_website: true, street_address: "111 Dock St", city: "Miami", state: "FL", zip_code: "33101", country: "US", lead_score: 55, lead_temperature: "warm", status: "new", source: "google_ads", deal_value: 30000, expected_close_date: getFutureDate(60), next_follow_up: getFutureDate(3), tags: ["logistics", "fleet"], notes: "Inbound from Google Ads. Needs fleet management.", assigned_to: userId, created_at: getPastDate(5) },
      { business_name: "Sunset Real Estate", business_type: "LLC", industry_category: "Real Estate", phone: "(555) 010-0010", email: "listings@sunsetrealty.com", website_url: "https://sunsetrealty.com", has_website: true, street_address: "222 Sunset Blvd", city: "Los Angeles", state: "CA", zip_code: "90028", country: "US", lead_score: 20, lead_temperature: "cold", status: "lost", source: "cold_email", deal_value: 0, expected_close_date: null, next_follow_up: null, tags: ["real-estate"], notes: "Went with competitor. May revisit in Q3.", assigned_to: userId, created_at: getPastDate(120) },
    ];

    const { data: bizData, error: bizError } = await service
      .from("businesses")
      .insert(businesses)
      .select("id");

    if (bizError) {
      return handleApiError(bizError, { route: "/api/admin/seed", action: "insert_businesses" });
    }

    const bizIds = bizData.map((b) => b.id);

    // Step 4: Insert 10 contacts
    const contacts = [
      { business_id: bizIds[0], first_name: "Sarah", last_name: "Chen", title: "VP of Sales", email: "sarah.chen@acmecorp.com", phone: "(555) 100-1010", linkedin_url: "https://linkedin.com/in/sarahchen", is_primary: true },
      { business_id: bizIds[0], first_name: "Mike", last_name: "Johnson", title: "CTO", email: "mike.j@acmecorp.com", phone: "(555) 100-1011", linkedin_url: "https://linkedin.com/in/mikejohnson", is_primary: false },
      { business_id: bizIds[1], first_name: "Lisa", last_name: "Park", title: "CEO", email: "lisa@techstart.io", phone: "(555) 200-2020", linkedin_url: "https://linkedin.com/in/lisapark", is_primary: true },
      { business_id: bizIds[2], first_name: "Tom", last_name: "Rivera", title: "Operations Manager", email: "tom@greenleaf.com", phone: "(555) 300-3030", is_primary: true },
      { business_id: bizIds[3], first_name: "James", last_name: "Wright", title: "Project Director", email: "james.w@buildright.co", phone: "(555) 400-4040", linkedin_url: "https://linkedin.com/in/jameswright", is_primary: true },
      { business_id: bizIds[4], first_name: "Emma", last_name: "Blake", title: "Owner", email: "emma@pixelperfect.design", phone: "(555) 500-5050", linkedin_url: "https://linkedin.com/in/emmablake", is_primary: true },
      { business_id: bizIds[5], first_name: "David", last_name: "Kim", title: "Head of Partnerships", email: "david.kim@cloudnine.io", phone: "(555) 600-6060", linkedin_url: "https://linkedin.com/in/davidkim", is_primary: true },
      { business_id: bizIds[6], first_name: "Rachel", last_name: "Adams", title: "Chief Medical Officer", email: "r.adams@medicareplus.org", phone: "(555) 700-7070", linkedin_url: "https://linkedin.com/in/racheladams", is_primary: true },
      { business_id: bizIds[7], first_name: "Alan", last_name: "Torres", title: "Dean of Technology", email: "alan.t@edulearn.edu", phone: "(555) 800-8080", is_primary: true },
      { business_id: bizIds[8], first_name: "Carlos", last_name: "Mendez", title: "Logistics Coordinator", email: "carlos@fastfreight.com", phone: "(555) 900-9090", linkedin_url: "https://linkedin.com/in/carlosmendez", is_primary: true },
    ];

    const { data: contactData, error: contactError } = await service
      .from("contacts")
      .insert(contacts)
      .select("id");

    if (contactError) {
      return handleApiError(contactError, { route: "/api/admin/seed", action: "insert_contacts" });
    }

    const contactIds = contactData.map((c) => c.id);

    // Step 5: Insert 10 activities
    const activities = [
      { business_id: bizIds[0], contact_id: contactIds[0], user_id: userId, activity_type: "email_sent", subject: "Follow-up: Product Demo", description: "Sent detailed pricing proposal after demo call.", outcome: "positive", metadata: { source: "manual" }, created_at: getPastDate(2) },
      { business_id: bizIds[0], contact_id: contactIds[1], user_id: userId, activity_type: "meeting_completed", subject: "Technical Deep Dive", description: "Discussed API integration requirements with CTO.", outcome: "positive", metadata: { duration_minutes: 45 }, created_at: getPastDate(5) },
      { business_id: bizIds[1], contact_id: contactIds[2], user_id: userId, activity_type: "call_outbound", subject: "Discovery Call", description: "Initial call with Lisa. They need 5 seats.", outcome: "positive", metadata: { duration_minutes: 30 }, created_at: getPastDate(8) },
      { business_id: bizIds[2], contact_id: contactIds[3], user_id: userId, activity_type: "email_received", subject: "RE: Pricing Question", description: "Tom asked about volume discounts for 20+ users.", outcome: null, metadata: { source: "email_capture" }, created_at: getPastDate(1) },
      { business_id: bizIds[3], contact_id: contactIds[4], user_id: userId, activity_type: "note", subject: "Contract Review Notes", description: "Legal team has minor concerns about SLA terms. Need to revise section 4.2.", outcome: null, metadata: {}, created_at: getPastDate(3) },
      { business_id: bizIds[4], contact_id: contactIds[5], user_id: userId, activity_type: "email_sent", subject: "Welcome & Getting Started", description: "Sent onboarding materials and setup guide.", outcome: "positive", metadata: { template: "welcome" }, created_at: getPastDate(10) },
      { business_id: bizIds[5], contact_id: contactIds[6], user_id: userId, activity_type: "meeting_scheduled", subject: "Onboarding Kickoff", description: "Scheduled onboarding session for next Monday.", outcome: null, metadata: {}, created_at: getPastDate(1) },
      { business_id: bizIds[6], contact_id: contactIds[7], user_id: userId, activity_type: "call_inbound", subject: "Compliance Questions", description: "Dr. Adams called with HIPAA compliance questions. Forwarded to security team.", outcome: "neutral", metadata: { duration_minutes: 20 }, created_at: getPastDate(4) },
      { business_id: bizIds[7], contact_id: contactIds[8], user_id: userId, activity_type: "status_change", subject: "Status: New → Contacted", description: "Moved to contacted after initial outreach email.", outcome: null, metadata: { old_status: "new", new_status: "contacted" }, created_at: getPastDate(7) },
      { business_id: bizIds[8], contact_id: contactIds[9], user_id: userId, activity_type: "task_completed", subject: "Prepare Custom Proposal", description: "Completed custom fleet management proposal for FastFreight.", outcome: "positive", metadata: {}, created_at: getPastDate(2) },
    ];

    await service.from("activities").insert(activities);

    // Step 6: Insert 10 campaigns
    const campaigns = [
      { name: "Q1 Cold Outreach", description: "Email outreach to new prospects", campaign_type: "email", status: "active", budget: 5000, started_at: getPastDate(30), created_by: userId, created_at: getPastDate(30) },
      { name: "SaaS Decision Makers", description: "Targeted campaign for SaaS company CTOs", campaign_type: "cold_call", status: "active", budget: 8000, started_at: getPastDate(20), created_by: userId, created_at: getPastDate(20) },
      { name: "Partner Referral Program", description: "Multi-channel campaign for partner leads", campaign_type: "multi_channel", status: "active", budget: 12000, started_at: getPastDate(45), created_by: userId, created_at: getPastDate(45) },
      { name: "Healthcare Vertical Push", description: "Targeted outreach to healthcare orgs", campaign_type: "email", status: "draft", budget: 15000, created_by: userId, created_at: getPastDate(5) },
      { name: "Re-engagement Campaign", description: "Win-back campaign for lost/cold leads", campaign_type: "email", status: "paused", budget: 3000, started_at: getPastDate(60), created_by: userId, created_at: getPastDate(60) },
      { name: "Webinar Follow-up", description: "Follow-up sequence for webinar attendees", campaign_type: "email", status: "completed", budget: 2000, started_at: getPastDate(90), ended_at: getPastDate(60), created_by: userId, created_at: getPastDate(90) },
      { name: "Direct Mail - Enterprise", description: "Physical mailer for enterprise prospects", campaign_type: "mailer", status: "draft", budget: 20000, created_by: userId, created_at: getPastDate(2) },
      { name: "Social Media Blitz", description: "LinkedIn + Twitter outreach", campaign_type: "social", status: "active", budget: 6000, started_at: getPastDate(15), created_by: userId, created_at: getPastDate(15) },
      { name: "Product Launch Announce", description: "New feature announcement to pipeline", campaign_type: "email", status: "completed", budget: 1000, started_at: getPastDate(40), ended_at: getPastDate(35), created_by: userId, created_at: getPastDate(40) },
      { name: "Q2 Pipeline Accelerator", description: "Aggressive outreach to move deals forward", campaign_type: "multi_channel", status: "draft", budget: 25000, created_by: userId, created_at: getPastDate(1) },
    ];

    await service.from("campaigns").insert(campaigns);

    // Step 7: Insert 10 automation rules
    const rules = [
      { name: "Welcome Email on New Lead", description: "Send welcome email when a new lead is created", trigger_type: "lead_created", trigger_config: {}, action_type: "send_email", action_config: { template: "welcome" }, is_active: true, priority: 1, created_by: userId },
      { name: "Auto-assign to Sales Rep", description: "Assign hot leads to senior sales rep", trigger_type: "lead_created", trigger_config: { temperature: "hot" }, action_type: "assign_user", action_config: { assign_to: "round_robin" }, is_active: true, priority: 2, created_by: userId },
      { name: "Score Boost on Email Open", description: "Increase lead score by 5 on email open", trigger_type: "lead_updated", trigger_config: {}, action_type: "update_score", action_config: { increment: 5 }, is_active: true, priority: 3, created_by: userId },
      { name: "Follow-up Reminder", description: "Create task when lead inactive for 7 days", trigger_type: "inactivity", trigger_config: { days: 7 }, action_type: "create_task", action_config: { title: "Follow up with inactive lead" }, is_active: true, priority: 4, created_by: userId },
      { name: "Move to Qualified on Score 70+", description: "Auto-qualify leads with score above 70", trigger_type: "score_threshold", trigger_config: { threshold: 70 }, action_type: "update_status", action_config: { status: "qualified" }, is_active: true, priority: 5, created_by: userId },
      { name: "Add to Campaign on Import", description: "Auto-add imported leads to Q1 outreach", trigger_type: "lead_created", trigger_config: { source: "import" }, action_type: "add_to_campaign", action_config: {}, is_active: false, priority: 6, created_by: userId },
      { name: "Webhook on Deal Won", description: "Send webhook when deal is won", trigger_type: "status_changed", trigger_config: { to: "won" }, action_type: "send_webhook", action_config: { url: "https://hooks.slack.com/example" }, is_active: true, priority: 7, created_by: userId },
      { name: "Tag Hot Leads", description: "Add priority tag when temperature is hot", trigger_type: "lead_updated", trigger_config: {}, action_type: "add_tag", action_config: { tag: "priority" }, is_active: true, priority: 8, created_by: userId },
      { name: "Birthday Email", description: "Send birthday greeting on contact birthday", trigger_type: "date_based", trigger_config: {}, action_type: "send_email", action_config: { template: "birthday" }, is_active: false, priority: 9, created_by: userId },
      { name: "Escalate Stale Proposals", description: "Notify manager when proposal stale 14 days", trigger_type: "inactivity", trigger_config: { days: 14 }, action_type: "create_task", action_config: { title: "Escalate stale proposal" }, is_active: true, priority: 10, created_by: userId },
    ];

    await service.from("automation_rules").insert(rules);

    // Step 8: Insert 10 reports
    const reports = [
      { name: "Weekly Pipeline Summary", description: "Pipeline by status and deal value", report_type: "pipeline", filters: { date_range: "last_7_days" }, columns: ["status", "count", "deal_value"], schedule: "weekly", created_by: userId },
      { name: "Monthly Lead Source Analysis", description: "Leads by acquisition source", report_type: "source", filters: { date_range: "last_30_days" }, columns: ["source", "count"], schedule: "monthly", created_by: userId },
      { name: "Hot Leads Report", description: "All leads with temperature = hot", report_type: "leads", filters: { temperature: "hot" }, columns: ["business_name", "score", "deal_value"], created_by: userId },
      { name: "Activity Log", description: "All activities this week", report_type: "activity", filters: { date_range: "this_week" }, columns: ["type", "subject", "business"], schedule: "weekly", created_by: userId },
      { name: "Campaign Performance", description: "ROI metrics for all campaigns", report_type: "campaign", filters: { status: "active" }, columns: ["name", "budget", "leads"], schedule: "monthly", created_by: userId },
      { name: "Stale Deals (30+ days)", description: "Deals in proposal/negotiation 30+ days", report_type: "pipeline", filters: { stale_days: 30 }, columns: ["business_name", "status", "deal_value"], created_by: userId },
      { name: "Team Activity Scorecard", description: "Activities per team member", report_type: "team", filters: { date_range: "this_month" }, columns: ["user", "calls", "emails"], schedule: "monthly", created_by: userId },
      { name: "Revenue Forecast", description: "Expected revenue by close date", report_type: "forecast", filters: { date_range: "next_90_days" }, columns: ["month", "expected_revenue"], created_by: userId },
      { name: "Lost Deal Analysis", description: "Patterns in lost deals", report_type: "leads", filters: { status: "lost" }, columns: ["business_name", "source", "deal_value"], created_by: userId },
      { name: "New Leads This Week", description: "Leads created last 7 days", report_type: "leads", filters: { date_range: "last_7_days" }, columns: ["business_name", "source", "score"], schedule: "weekly", created_by: userId },
    ];

    await service.from("reports").insert(reports);

    return NextResponse.json({
      success: true,
      message: "Seed data created successfully!",
      profile: "admin + enterprise",
      data: {
        businesses: 10,
        contacts: 10,
        activities: 10,
        campaigns: 10,
        automationRules: 10,
        reports: 10,
      },
    });
  } catch (error) {
    return handleApiError(error, { route: "/api/admin/seed" });
  }
}

// Helper functions
function getPastDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function getFutureDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}
