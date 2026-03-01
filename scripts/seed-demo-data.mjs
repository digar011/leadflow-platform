// Seed demo data for LeadFlow/Goldyon Platform
// Uses service_role key to bypass RLS
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kitimzmjjuvznfiyjiuw.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY env var');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

function daysAgo(n) {
  return new Date(Date.now() - n * 86400000).toISOString();
}
function daysFromNow(n) {
  return new Date(Date.now() + n * 86400000).toISOString();
}
function today() {
  return new Date().toISOString().slice(0, 10);
}
function daysAgoDate(n) {
  return new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);
}

async function seed() {
  console.log('🌱 Starting demo data seed...\n');

  // 1. Get diego's user ID
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('id, email, role, subscription_tier')
    .eq('email', 'diego.j.garnica@gmail.com')
    .single();

  if (profileErr || !profile) {
    console.error('Could not find diego.j.garnica@gmail.com profile:', profileErr?.message);
    process.exit(1);
  }

  const userId = profile.id;
  console.log(`✅ Found user: ${profile.email} (${userId})`);
  console.log(`   Role: ${profile.role}, Tier: ${profile.subscription_tier}\n`);

  // 2. Ensure diego is super_admin + enterprise
  if (profile.role !== 'super_admin' || profile.subscription_tier !== 'enterprise') {
    const { error: updateErr } = await supabase
      .from('profiles')
      .update({ role: 'super_admin', subscription_tier: 'enterprise', is_active: true })
      .eq('id', userId);
    if (updateErr) console.warn('⚠️  Could not update profile (trigger may block):', updateErr.message);
    else console.log('✅ Updated diego to super_admin + enterprise\n');
  }

  // 3. Clean existing demo data to avoid duplicates
  console.log('🧹 Cleaning existing data...');
  const { count: bizCount } = await supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('assigned_to', userId);
  if (bizCount > 0) {
    // Delete in dependency order
    await supabase.from('automation_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('touchpoints').delete().in('business_id', (await supabase.from('businesses').select('id').eq('assigned_to', userId)).data?.map(b => b.id) || []);
    await supabase.from('captured_emails').delete().eq('user_id', userId);
    await supabase.from('activities').delete().eq('user_id', userId);
    await supabase.from('contacts').delete().in('business_id', (await supabase.from('businesses').select('id').eq('assigned_to', userId)).data?.map(b => b.id) || []);
    await supabase.from('campaign_members').delete().in('campaign_id', (await supabase.from('campaigns').select('id').eq('created_by', userId)).data?.map(c => c.id) || []);
    await supabase.from('businesses').delete().eq('assigned_to', userId);
    await supabase.from('campaigns').delete().eq('created_by', userId);
    await supabase.from('automation_rules').delete().eq('created_by', userId);
    await supabase.from('reports').delete().eq('created_by', userId);
    await supabase.from('audit_logs').delete().eq('user_id', userId);
    await supabase.from('analytics_snapshots').delete().gte('snapshot_date', daysAgoDate(10));
    console.log('   Cleaned existing records\n');
  }

  // 4. Insert Businesses (10 leads)
  console.log('📊 Inserting businesses...');
  const businesses = [
    { business_name: 'Acme Corp', business_type: 'LLC', industry_category: 'Technology', phone: '(555) 100-1001', email: 'info@acmecorp.com', website_url: 'https://acmecorp.com', has_website: true, street_address: '123 Main St', city: 'San Francisco', state: 'CA', zip_code: '94102', country: 'US', lead_score: 85, lead_temperature: 'hot', status: 'qualified', source: 'website', deal_value: 125000, expected_close_date: daysFromNow(30), next_follow_up: daysFromNow(2), tags: ['enterprise', 'saas'], notes: 'Key enterprise prospect. Met at SaaStr conference.', assigned_to: userId, created_at: daysAgo(45) },
    { business_name: 'TechStart Inc', business_type: 'Corporation', industry_category: 'SaaS', phone: '(555) 200-2002', email: 'hello@techstart.io', website_url: 'https://techstart.io', has_website: true, street_address: '456 Innovation Blvd', city: 'Austin', state: 'TX', zip_code: '78701', country: 'US', lead_score: 72, lead_temperature: 'warm', status: 'proposal', source: 'referral', deal_value: 45000, expected_close_date: daysFromNow(14), next_follow_up: daysFromNow(1), tags: ['startup', 'series-a'], notes: 'Referred by John at Acme. Needs CRM integration.', assigned_to: userId, created_at: daysAgo(30) },
    { business_name: 'GreenLeaf Organics', business_type: 'LLC', industry_category: 'Food & Beverage', phone: '(555) 300-3003', email: 'orders@greenleaf.com', website_url: 'https://greenleaf.com', has_website: true, street_address: '789 Farm Rd', city: 'Portland', state: 'OR', zip_code: '97201', country: 'US', lead_score: 60, lead_temperature: 'warm', status: 'contacted', source: 'cold_call', deal_value: 18000, expected_close_date: daysFromNow(60), next_follow_up: daysFromNow(5), tags: ['organic', 'retail'], notes: 'Interested in our marketing automation module.', assigned_to: userId, created_at: daysAgo(20) },
    { business_name: 'BuildRight Construction', business_type: 'Corporation', industry_category: 'Construction', phone: '(555) 400-4004', email: 'bids@buildright.co', website_url: 'https://buildright.co', has_website: true, street_address: '321 Steel Ave', city: 'Denver', state: 'CO', zip_code: '80202', country: 'US', lead_score: 90, lead_temperature: 'hot', status: 'negotiation', source: 'linkedin', deal_value: 250000, expected_close_date: daysFromNow(7), next_follow_up: daysFromNow(1), tags: ['construction', 'enterprise'], notes: 'Final contract review. Legal team involved.', assigned_to: userId, created_at: daysAgo(60) },
    { business_name: 'Pixel Perfect Design', business_type: 'Sole Proprietorship', industry_category: 'Design', phone: '(555) 500-5005', email: 'studio@pixelperfect.design', website_url: null, has_website: false, street_address: '555 Creative St', city: 'Brooklyn', state: 'NY', zip_code: '11201', country: 'US', lead_score: 35, lead_temperature: 'cold', status: 'new', source: 'import', deal_value: 5000, expected_close_date: null, next_follow_up: daysFromNow(7), tags: ['design', 'freelance'], notes: 'Small agency, exploring CRM options.', assigned_to: userId, created_at: daysAgo(3) },
    { business_name: 'CloudNine Solutions', business_type: 'LLC', industry_category: 'Cloud Services', phone: '(555) 600-6006', email: 'sales@cloudnine.io', website_url: 'https://cloudnine.io', has_website: true, street_address: '999 Cloud Way', city: 'Seattle', state: 'WA', zip_code: '98101', country: 'US', lead_score: 78, lead_temperature: 'hot', status: 'won', source: 'partner', deal_value: 75000, expected_close_date: daysAgo(5), next_follow_up: null, tags: ['cloud', 'partner'], notes: 'Deal closed! Onboarding scheduled for next week.', assigned_to: userId, created_at: daysAgo(90) },
    { business_name: 'MediCare Plus', business_type: 'Corporation', industry_category: 'Healthcare', phone: '(555) 700-7007', email: 'admin@medicareplus.org', website_url: 'https://medicareplus.org', has_website: true, street_address: '777 Health Pkwy', city: 'Chicago', state: 'IL', zip_code: '60601', country: 'US', lead_score: 65, lead_temperature: 'warm', status: 'qualified', source: 'webinar', deal_value: 95000, expected_close_date: daysFromNow(45), next_follow_up: daysFromNow(3), tags: ['healthcare', 'hipaa'], notes: 'Needs HIPAA-compliant solution. Demo scheduled.', assigned_to: userId, created_at: daysAgo(15) },
    { business_name: 'EduLearn Academy', business_type: 'Non-Profit', industry_category: 'Education', phone: '(555) 800-8008', email: 'info@edulearn.edu', website_url: 'https://edulearn.edu', has_website: true, street_address: '888 Campus Dr', city: 'Boston', state: 'MA', zip_code: '02101', country: 'US', lead_score: 45, lead_temperature: 'cold', status: 'contacted', source: 'event', deal_value: 12000, expected_close_date: daysFromNow(90), next_follow_up: daysFromNow(14), tags: ['education', 'non-profit'], notes: 'Met at EdTech conference. Budget limited.', assigned_to: userId, created_at: daysAgo(10) },
    { business_name: 'FastFreight Logistics', business_type: 'LLC', industry_category: 'Logistics', phone: '(555) 900-9009', email: 'ops@fastfreight.com', website_url: 'https://fastfreight.com', has_website: true, street_address: '111 Dock St', city: 'Miami', state: 'FL', zip_code: '33101', country: 'US', lead_score: 55, lead_temperature: 'warm', status: 'new', source: 'google_ads', deal_value: 30000, expected_close_date: daysFromNow(60), next_follow_up: daysFromNow(3), tags: ['logistics', 'fleet'], notes: 'Inbound from Google Ads. Needs fleet management.', assigned_to: userId, created_at: daysAgo(5) },
    { business_name: 'Sunset Real Estate', business_type: 'LLC', industry_category: 'Real Estate', phone: '(555) 010-0010', email: 'listings@sunsetrealty.com', website_url: 'https://sunsetrealty.com', has_website: true, street_address: '222 Sunset Blvd', city: 'Los Angeles', state: 'CA', zip_code: '90028', country: 'US', lead_score: 20, lead_temperature: 'cold', status: 'lost', source: 'cold_email', deal_value: 0, expected_close_date: null, next_follow_up: null, tags: ['real-estate'], notes: 'Went with competitor. May revisit in Q3.', assigned_to: userId, created_at: daysAgo(120) },
  ];

  const { data: bizData, error: bizErr } = await supabase.from('businesses').insert(businesses).select('id, business_name, created_at');
  if (bizErr) { console.error('❌ Businesses insert failed:', bizErr.message); process.exit(1); }
  const bizIds = bizData.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)).map(b => b.id);
  console.log(`   ✅ ${bizIds.length} businesses inserted`);

  // 5. Insert Contacts (10 contacts)
  console.log('👥 Inserting contacts...');
  const contacts = [
    { business_id: bizIds[0], first_name: 'Sarah', last_name: 'Chen', title: 'VP of Sales', email: 'sarah.chen@acmecorp.com', phone: '(555) 100-1010', linkedin_url: 'https://linkedin.com/in/sarahchen', is_primary: true },
    { business_id: bizIds[0], first_name: 'Mike', last_name: 'Johnson', title: 'CTO', email: 'mike.j@acmecorp.com', phone: '(555) 100-1011', linkedin_url: 'https://linkedin.com/in/mikejohnson', is_primary: false },
    { business_id: bizIds[1], first_name: 'Lisa', last_name: 'Park', title: 'CEO', email: 'lisa@techstart.io', phone: '(555) 200-2020', linkedin_url: 'https://linkedin.com/in/lisapark', is_primary: true },
    { business_id: bizIds[2], first_name: 'Tom', last_name: 'Rivera', title: 'Operations Manager', email: 'tom@greenleaf.com', phone: '(555) 300-3030', linkedin_url: null, is_primary: true },
    { business_id: bizIds[3], first_name: 'James', last_name: 'Wright', title: 'Project Director', email: 'james.w@buildright.co', phone: '(555) 400-4040', linkedin_url: 'https://linkedin.com/in/jameswright', is_primary: true },
    { business_id: bizIds[4], first_name: 'Emma', last_name: 'Blake', title: 'Owner', email: 'emma@pixelperfect.design', phone: '(555) 500-5050', linkedin_url: 'https://linkedin.com/in/emmablake', is_primary: true },
    { business_id: bizIds[5], first_name: 'David', last_name: 'Kim', title: 'Head of Partnerships', email: 'david.kim@cloudnine.io', phone: '(555) 600-6060', linkedin_url: 'https://linkedin.com/in/davidkim', is_primary: true },
    { business_id: bizIds[6], first_name: 'Rachel', last_name: 'Adams', title: 'Chief Medical Officer', email: 'r.adams@medicareplus.org', phone: '(555) 700-7070', linkedin_url: 'https://linkedin.com/in/dracheladams', is_primary: true },
    { business_id: bizIds[7], first_name: 'Alan', last_name: 'Torres', title: 'Dean of Technology', email: 'alan.t@edulearn.edu', phone: '(555) 800-8080', linkedin_url: null, is_primary: true },
    { business_id: bizIds[8], first_name: 'Carlos', last_name: 'Mendez', title: 'Logistics Coordinator', email: 'carlos@fastfreight.com', phone: '(555) 900-9090', linkedin_url: 'https://linkedin.com/in/carlosmendez', is_primary: true },
  ];

  const { data: contactData, error: contactErr } = await supabase.from('contacts').insert(contacts).select('id, business_id, created_at');
  if (contactErr) { console.error('❌ Contacts insert failed:', contactErr.message); process.exit(1); }
  const contactIds = contactData.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)).map(c => c.id);
  console.log(`   ✅ ${contactIds.length} contacts inserted`);

  // 6. Insert Activities (10 mixed types)
  console.log('📝 Inserting activities...');
  const activities = [
    { business_id: bizIds[0], contact_id: contactIds[0], user_id: userId, activity_type: 'email_sent', subject: 'Follow-up: Product Demo', description: 'Sent detailed pricing proposal after demo call.', outcome: 'positive', metadata: { source: 'manual' }, created_at: daysAgo(2) },
    { business_id: bizIds[0], contact_id: contactIds[1], user_id: userId, activity_type: 'meeting_completed', subject: 'Technical Deep Dive', description: 'Discussed API integration requirements with CTO.', outcome: 'positive', metadata: { duration_minutes: 45 }, created_at: daysAgo(5) },
    { business_id: bizIds[1], contact_id: contactIds[2], user_id: userId, activity_type: 'call_outbound', subject: 'Discovery Call', description: 'Initial call with Lisa. They need 5 seats.', outcome: 'positive', metadata: { duration_minutes: 30 }, created_at: daysAgo(8) },
    { business_id: bizIds[2], contact_id: contactIds[3], user_id: userId, activity_type: 'email_received', subject: 'RE: Pricing Question', description: 'Tom asked about volume discounts for 20+ users.', outcome: null, metadata: { source: 'email_capture' }, created_at: daysAgo(1) },
    { business_id: bizIds[3], contact_id: contactIds[4], user_id: userId, activity_type: 'note', subject: 'Contract Review Notes', description: 'Legal team has minor concerns about SLA terms. Need to revise section 4.2.', outcome: null, metadata: {}, created_at: daysAgo(3) },
    { business_id: bizIds[4], contact_id: contactIds[5], user_id: userId, activity_type: 'email_sent', subject: 'Welcome & Getting Started', description: 'Sent onboarding materials and setup guide.', outcome: 'positive', metadata: { template: 'welcome' }, created_at: daysAgo(10) },
    { business_id: bizIds[5], contact_id: contactIds[6], user_id: userId, activity_type: 'meeting_scheduled', subject: 'Onboarding Kickoff', description: 'Scheduled onboarding session for next Monday.', outcome: null, metadata: { scheduled_for: '2026-02-16T10:00:00Z' }, created_at: daysAgo(1) },
    { business_id: bizIds[6], contact_id: contactIds[7], user_id: userId, activity_type: 'call_inbound', subject: 'Compliance Questions', description: 'Dr. Adams called with HIPAA compliance questions. Forwarded to security team.', outcome: 'neutral', metadata: { duration_minutes: 20 }, created_at: daysAgo(4) },
    { business_id: bizIds[7], contact_id: contactIds[8], user_id: userId, activity_type: 'status_change', subject: 'Status: New -> Contacted', description: 'Moved to contacted after initial outreach email.', outcome: null, metadata: { old_status: 'new', new_status: 'contacted' }, created_at: daysAgo(7) },
    { business_id: bizIds[8], contact_id: contactIds[9], user_id: userId, activity_type: 'task_completed', subject: 'Prepare Custom Proposal', description: 'Completed custom fleet management proposal for FastFreight.', outcome: 'positive', metadata: {}, created_at: daysAgo(2) },
  ];

  const { error: actErr } = await supabase.from('activities').insert(activities);
  if (actErr) { console.error('❌ Activities insert failed:', actErr.message); process.exit(1); }
  console.log('   ✅ 10 activities inserted');

  // 7. Insert Campaigns (10 campaigns)
  console.log('📣 Inserting campaigns...');
  const campaigns = [
    { name: 'Q1 Cold Outreach', description: 'Email outreach to new prospects from LinkedIn scraping', campaign_type: 'email', status: 'active', budget: 5000, started_at: daysAgo(30), ended_at: null, created_by: userId, created_at: daysAgo(30) },
    { name: 'SaaS Decision Makers', description: 'Targeted campaign for SaaS company CTOs and VPs', campaign_type: 'cold_call', status: 'active', budget: 8000, started_at: daysAgo(20), ended_at: null, created_by: userId, created_at: daysAgo(20) },
    { name: 'Partner Referral Program', description: 'Multi-channel campaign for partner referral leads', campaign_type: 'multi_channel', status: 'active', budget: 12000, started_at: daysAgo(45), ended_at: null, created_by: userId, created_at: daysAgo(45) },
    { name: 'Healthcare Vertical Push', description: 'Targeted outreach to healthcare organizations', campaign_type: 'email', status: 'draft', budget: 15000, started_at: null, ended_at: null, created_by: userId, created_at: daysAgo(5) },
    { name: 'Re-engagement Campaign', description: 'Win-back campaign for lost/cold leads', campaign_type: 'email', status: 'paused', budget: 3000, started_at: daysAgo(60), ended_at: null, created_by: userId, created_at: daysAgo(60) },
    { name: 'Webinar Follow-up', description: 'Follow-up sequence for webinar attendees', campaign_type: 'email', status: 'completed', budget: 2000, started_at: daysAgo(90), ended_at: daysAgo(60), created_by: userId, created_at: daysAgo(90) },
    { name: 'Direct Mail - Enterprise', description: 'Physical mailer campaign for enterprise prospects', campaign_type: 'mailer', status: 'draft', budget: 20000, started_at: null, ended_at: null, created_by: userId, created_at: daysAgo(2) },
    { name: 'Social Media Blitz', description: 'LinkedIn + Twitter outreach for brand awareness', campaign_type: 'social', status: 'active', budget: 6000, started_at: daysAgo(15), ended_at: null, created_by: userId, created_at: daysAgo(15) },
    { name: 'Product Launch Announce', description: 'New feature announcement to existing pipeline', campaign_type: 'email', status: 'completed', budget: 1000, started_at: daysAgo(40), ended_at: daysAgo(35), created_by: userId, created_at: daysAgo(40) },
    { name: 'Q2 Pipeline Accelerator', description: 'Aggressive outreach to move deals forward', campaign_type: 'multi_channel', status: 'draft', budget: 25000, started_at: null, ended_at: null, created_by: userId, created_at: daysAgo(1) },
  ];

  const { data: campData, error: campErr } = await supabase.from('campaigns').insert(campaigns).select('id, created_at');
  if (campErr) { console.error('❌ Campaigns insert failed:', campErr.message); process.exit(1); }
  const campIds = campData.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)).map(c => c.id);
  console.log(`   ✅ ${campIds.length} campaigns inserted`);

  // 8. Insert Automation Rules (10 rules)
  console.log('⚙️  Inserting automation rules...');
  const rules = [
    { name: 'Welcome Email on New Lead', description: 'Send welcome email when a new lead is created', trigger_type: 'lead_created', trigger_config: {}, action_type: 'send_email', action_config: { template: 'welcome', subject: 'Welcome to LeadFlow!' }, is_active: true, priority: 1, created_by: userId, created_at: daysAgo(60) },
    { name: 'Auto-assign to Sales Rep', description: 'Assign hot leads to senior sales rep', trigger_type: 'lead_created', trigger_config: { temperature: 'hot' }, action_type: 'assign_user', action_config: { assign_to: 'round_robin' }, is_active: true, priority: 2, created_by: userId, created_at: daysAgo(55) },
    { name: 'Score Boost on Email Open', description: 'Increase lead score by 5 when email is opened', trigger_type: 'lead_updated', trigger_config: { field: 'email_opened' }, action_type: 'update_score', action_config: { increment: 5 }, is_active: true, priority: 3, created_by: userId, created_at: daysAgo(50) },
    { name: 'Follow-up Reminder', description: 'Create task when lead is inactive for 7 days', trigger_type: 'inactivity', trigger_config: { days: 7 }, action_type: 'create_task', action_config: { title: 'Follow up with inactive lead', priority: 'high' }, is_active: true, priority: 4, created_by: userId, created_at: daysAgo(45) },
    { name: 'Move to Qualified on Score 70+', description: 'Auto-qualify leads with score above 70', trigger_type: 'score_threshold', trigger_config: { threshold: 70, direction: 'above' }, action_type: 'update_status', action_config: { status: 'qualified' }, is_active: true, priority: 5, created_by: userId, created_at: daysAgo(40) },
    { name: 'Add to Campaign on Import', description: 'Auto-add imported leads to Q1 outreach', trigger_type: 'lead_created', trigger_config: { source: 'import' }, action_type: 'add_to_campaign', action_config: { campaign: 'Q1 Cold Outreach' }, is_active: false, priority: 6, created_by: userId, created_at: daysAgo(35) },
    { name: 'Webhook on Deal Won', description: 'Send webhook notification when deal is won', trigger_type: 'status_changed', trigger_config: { to: 'won' }, action_type: 'send_webhook', action_config: { url: 'https://hooks.slack.com/example' }, is_active: true, priority: 7, created_by: userId, created_at: daysAgo(30) },
    { name: 'Tag Hot Leads', description: 'Add priority tag when temperature changes to hot', trigger_type: 'lead_updated', trigger_config: { field: 'lead_temperature', value: 'hot' }, action_type: 'add_tag', action_config: { tag: 'priority' }, is_active: true, priority: 8, created_by: userId, created_at: daysAgo(25) },
    { name: 'Birthday Email', description: 'Send birthday greeting on contact birthday', trigger_type: 'date_based', trigger_config: { field: 'birthday', offset_days: 0 }, action_type: 'send_email', action_config: { template: 'birthday' }, is_active: false, priority: 9, created_by: userId, created_at: daysAgo(20) },
    { name: 'Escalate Stale Proposals', description: 'Notify manager when proposal is stale for 14 days', trigger_type: 'inactivity', trigger_config: { days: 14, status: 'proposal' }, action_type: 'create_task', action_config: { title: 'Escalate stale proposal', assign_to: 'manager' }, is_active: true, priority: 10, created_by: userId, created_at: daysAgo(15) },
  ];

  const { data: ruleData, error: ruleErr } = await supabase.from('automation_rules').insert(rules).select('id, created_at');
  if (ruleErr) { console.error('❌ Automation rules insert failed:', ruleErr.message); process.exit(1); }
  const ruleIds = ruleData.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)).map(r => r.id);
  console.log(`   ✅ ${ruleIds.length} automation rules inserted`);

  // 9. Insert Reports (10 saved reports)
  console.log('📈 Inserting reports...');
  const reports = [
    { name: 'Weekly Pipeline Summary', description: 'Overview of pipeline by status and deal value', report_type: 'pipeline', filters: { date_range: 'last_7_days' }, columns: ['status', 'count', 'deal_value'], schedule: 'weekly', created_by: userId, created_at: daysAgo(30) },
    { name: 'Monthly Lead Source Analysis', description: 'Breakdown of leads by acquisition source', report_type: 'source', filters: { date_range: 'last_30_days' }, columns: ['source', 'count', 'conversion_rate'], schedule: 'monthly', created_by: userId, created_at: daysAgo(28) },
    { name: 'Hot Leads Report', description: 'All leads with temperature = hot', report_type: 'leads', filters: { temperature: 'hot' }, columns: ['business_name', 'score', 'deal_value', 'status'], schedule: null, created_by: userId, created_at: daysAgo(25) },
    { name: 'Activity Log - This Week', description: 'All activities logged this week', report_type: 'activity', filters: { date_range: 'this_week' }, columns: ['type', 'subject', 'business', 'date'], schedule: 'weekly', created_by: userId, created_at: daysAgo(20) },
    { name: 'Campaign Performance', description: 'ROI and conversion metrics for all campaigns', report_type: 'campaign', filters: { status: 'active' }, columns: ['name', 'budget', 'leads', 'conversions', 'roi'], schedule: 'monthly', created_by: userId, created_at: daysAgo(18) },
    { name: 'Stale Deals (30+ days)', description: 'Deals in proposal/negotiation for 30+ days', report_type: 'pipeline', filters: { stale_days: 30, status: ['proposal', 'negotiation'] }, columns: ['business_name', 'status', 'days_stale', 'deal_value'], schedule: null, created_by: userId, created_at: daysAgo(15) },
    { name: 'Team Activity Scorecard', description: 'Activities per team member this month', report_type: 'team', filters: { date_range: 'this_month' }, columns: ['user', 'calls', 'emails', 'meetings', 'deals_won'], schedule: 'monthly', created_by: userId, created_at: daysAgo(12) },
    { name: 'Revenue Forecast', description: 'Expected revenue by close date', report_type: 'forecast', filters: { date_range: 'next_90_days' }, columns: ['month', 'expected_revenue', 'weighted_revenue', 'deal_count'], schedule: null, created_by: userId, created_at: daysAgo(10) },
    { name: 'Lost Deal Analysis', description: 'Reasons and patterns in lost deals', report_type: 'leads', filters: { status: 'lost' }, columns: ['business_name', 'source', 'deal_value', 'days_in_pipeline', 'notes'], schedule: null, created_by: userId, created_at: daysAgo(7) },
    { name: 'New Leads This Week', description: 'Leads created in the last 7 days', report_type: 'leads', filters: { date_range: 'last_7_days', status: 'new' }, columns: ['business_name', 'source', 'score', 'created_at'], schedule: 'weekly', created_by: userId, created_at: daysAgo(3) },
  ];

  const { error: reportErr } = await supabase.from('reports').insert(reports);
  if (reportErr) { console.error('❌ Reports insert failed:', reportErr.message); process.exit(1); }
  console.log('   ✅ 10 reports inserted');

  // 10. Insert Captured Emails (10 entries)
  console.log('📧 Inserting captured emails...');
  const emails = [
    { user_id: userId, business_id: bizIds[0], direction: 'outbound', from_address: 'diego.j.garnica@gmail.com', to_addresses: ['sarah.chen@acmecorp.com'], cc_addresses: [], subject: 'Re: Product Demo Follow-up', body_snippet: 'Hi Sarah, great speaking with you today. Here is our pricing proposal...', message_id: '<msg001@mail.leadflow.app>', matched: true, created_at: daysAgo(2) },
    { user_id: userId, business_id: bizIds[0], direction: 'inbound', from_address: 'sarah.chen@acmecorp.com', to_addresses: ['diego.j.garnica@gmail.com'], cc_addresses: [], subject: 'Re: Product Demo Follow-up', body_snippet: 'Thanks Diego! I shared this with our procurement team. We should have feedback by...', message_id: '<msg002@mail.acmecorp.com>', matched: true, created_at: daysAgo(1) },
    { user_id: userId, business_id: bizIds[1], direction: 'outbound', from_address: 'diego.j.garnica@gmail.com', to_addresses: ['lisa@techstart.io'], cc_addresses: [], subject: 'Partnership Opportunity', body_snippet: 'Hi Lisa, I wanted to reach out about a potential partnership between our platforms...', message_id: '<msg003@mail.leadflow.app>', matched: true, created_at: daysAgo(8) },
    { user_id: userId, business_id: bizIds[2], direction: 'inbound', from_address: 'tom@greenleaf.com', to_addresses: ['diego.j.garnica@gmail.com'], cc_addresses: [], subject: 'Volume Discount Inquiry', body_snippet: 'Hello, we are looking at onboarding 20+ team members. Do you offer volume discounts?', message_id: '<msg004@mail.greenleaf.com>', matched: true, created_at: daysAgo(1) },
    { user_id: userId, business_id: bizIds[3], direction: 'outbound', from_address: 'diego.j.garnica@gmail.com', to_addresses: ['james.w@buildright.co'], cc_addresses: ['legal@buildright.co'], subject: 'Updated Contract - Section 4.2 Revised', body_snippet: 'James, please find the updated contract with revised SLA terms in section 4.2...', message_id: '<msg005@mail.leadflow.app>', matched: true, created_at: daysAgo(3) },
    { user_id: userId, business_id: null, direction: 'inbound', from_address: 'unknown@randomcompany.com', to_addresses: ['diego.j.garnica@gmail.com'], cc_addresses: [], subject: 'Interested in your CRM', body_snippet: 'Hi, I found your product online and would like to learn more about pricing...', message_id: '<msg006@mail.random.com>', matched: false, created_at: daysAgo(6) },
    { user_id: userId, business_id: bizIds[5], direction: 'outbound', from_address: 'diego.j.garnica@gmail.com', to_addresses: ['david.kim@cloudnine.io'], cc_addresses: [], subject: 'Onboarding Schedule', body_snippet: 'David, confirming our onboarding kickoff for Monday at 10am PST...', message_id: '<msg007@mail.leadflow.app>', matched: true, created_at: daysAgo(1) },
    { user_id: userId, business_id: bizIds[6], direction: 'inbound', from_address: 'r.adams@medicareplus.org', to_addresses: ['diego.j.garnica@gmail.com'], cc_addresses: ['compliance@medicareplus.org'], subject: 'HIPAA Compliance Documentation', body_snippet: 'Diego, could you please provide your SOC2 and HIPAA compliance documentation?', message_id: '<msg008@mail.medicareplus.org>', matched: true, created_at: daysAgo(4) },
    { user_id: userId, business_id: null, direction: 'inbound', from_address: 'newsletter@saasweekly.com', to_addresses: ['diego.j.garnica@gmail.com'], cc_addresses: [], subject: 'SaaS Weekly Newsletter #142', body_snippet: 'This week in SaaS: Top CRM trends for 2026...', message_id: '<msg009@mail.saasweekly.com>', matched: false, created_at: daysAgo(2) },
    { user_id: userId, business_id: bizIds[8], direction: 'outbound', from_address: 'diego.j.garnica@gmail.com', to_addresses: ['carlos@fastfreight.com'], cc_addresses: [], subject: 'Custom Fleet Management Proposal', body_snippet: 'Carlos, attached is our custom proposal for FastFreight fleet management integration...', message_id: '<msg010@mail.leadflow.app>', matched: true, created_at: daysAgo(2) },
  ];

  const { error: emailErr } = await supabase.from('captured_emails').insert(emails);
  if (emailErr) { console.error('❌ Captured emails insert failed:', emailErr.message); process.exit(1); }
  console.log('   ✅ 10 captured emails inserted');

  // 11. Insert Touchpoints (10 journey points)
  console.log('📍 Inserting touchpoints...');
  const touchpoints = [
    { business_id: bizIds[0], contact_id: contactIds[0], type: 'website_visit', source: 'organic', campaign_id: null, metadata: { page: '/pricing', duration_seconds: 120 }, occurred_at: daysAgo(50) },
    { business_id: bizIds[0], contact_id: contactIds[0], type: 'form_submit', source: 'organic', campaign_id: null, metadata: { form: 'demo_request', fields: ['name', 'email', 'company'] }, occurred_at: daysAgo(48) },
    { business_id: bizIds[1], contact_id: contactIds[2], type: 'email_open', source: 'campaign', campaign_id: campIds[0], metadata: { subject: 'Q1 Outreach' }, occurred_at: daysAgo(25) },
    { business_id: bizIds[1], contact_id: contactIds[2], type: 'email_click', source: 'campaign', campaign_id: campIds[0], metadata: { link: '/pricing' }, occurred_at: daysAgo(25) },
    { business_id: bizIds[2], contact_id: contactIds[3], type: 'call', source: 'outbound', campaign_id: null, metadata: { duration_minutes: 15, outcome: 'interested' }, occurred_at: daysAgo(18) },
    { business_id: bizIds[3], contact_id: contactIds[4], type: 'meeting', source: 'referral', campaign_id: null, metadata: { type: 'video', duration_minutes: 60 }, occurred_at: daysAgo(30) },
    { business_id: bizIds[4], contact_id: contactIds[5], type: 'ad_click', source: 'google_ads', campaign_id: null, metadata: { campaign: 'CRM Tools 2026', cost: 2.50 }, occurred_at: daysAgo(5) },
    { business_id: bizIds[6], contact_id: contactIds[7], type: 'website_visit', source: 'webinar', campaign_id: campIds[5], metadata: { page: '/healthcare', duration_seconds: 300 }, occurred_at: daysAgo(16) },
    { business_id: bizIds[7], contact_id: contactIds[8], type: 'social_interaction', source: 'linkedin', campaign_id: null, metadata: { type: 'comment', post_id: '12345' }, occurred_at: daysAgo(12) },
    { business_id: bizIds[8], contact_id: contactIds[9], type: 'form_submit', source: 'google_ads', campaign_id: null, metadata: { form: 'contact_us', fields: ['name', 'email', 'fleet_size'] }, occurred_at: daysAgo(5) },
  ];

  const { error: tpErr } = await supabase.from('touchpoints').insert(touchpoints);
  if (tpErr) { console.error('❌ Touchpoints insert failed:', tpErr.message); process.exit(1); }
  console.log('   ✅ 10 touchpoints inserted');

  // 12. Insert Analytics Snapshots (10 days)
  console.log('📉 Inserting analytics snapshots...');
  const snapshots = [
    { snapshot_date: daysAgoDate(9), total_leads: 42, new_leads: 5, contacted_leads: 12, converted_leads: 3, emails_sent: 28, emails_opened: 14, calls_made: 8, meetings_booked: 3, revenue_pipeline: 450000, revenue_closed: 75000 },
    { snapshot_date: daysAgoDate(8), total_leads: 44, new_leads: 3, contacted_leads: 13, converted_leads: 1, emails_sent: 32, emails_opened: 18, calls_made: 6, meetings_booked: 2, revenue_pipeline: 465000, revenue_closed: 75000 },
    { snapshot_date: daysAgoDate(7), total_leads: 45, new_leads: 2, contacted_leads: 14, converted_leads: 2, emails_sent: 25, emails_opened: 12, calls_made: 10, meetings_booked: 4, revenue_pipeline: 480000, revenue_closed: 87000 },
    { snapshot_date: daysAgoDate(6), total_leads: 47, new_leads: 4, contacted_leads: 14, converted_leads: 1, emails_sent: 30, emails_opened: 16, calls_made: 7, meetings_booked: 3, revenue_pipeline: 495000, revenue_closed: 87000 },
    { snapshot_date: daysAgoDate(5), total_leads: 48, new_leads: 2, contacted_leads: 15, converted_leads: 2, emails_sent: 22, emails_opened: 11, calls_made: 5, meetings_booked: 1, revenue_pipeline: 510000, revenue_closed: 112000 },
    { snapshot_date: daysAgoDate(4), total_leads: 50, new_leads: 3, contacted_leads: 16, converted_leads: 1, emails_sent: 35, emails_opened: 20, calls_made: 9, meetings_booked: 4, revenue_pipeline: 525000, revenue_closed: 112000 },
    { snapshot_date: daysAgoDate(3), total_leads: 52, new_leads: 4, contacted_leads: 16, converted_leads: 3, emails_sent: 28, emails_opened: 15, calls_made: 8, meetings_booked: 2, revenue_pipeline: 540000, revenue_closed: 150000 },
    { snapshot_date: daysAgoDate(2), total_leads: 54, new_leads: 3, contacted_leads: 17, converted_leads: 1, emails_sent: 31, emails_opened: 17, calls_made: 6, meetings_booked: 3, revenue_pipeline: 555000, revenue_closed: 150000 },
    { snapshot_date: daysAgoDate(1), total_leads: 56, new_leads: 5, contacted_leads: 18, converted_leads: 2, emails_sent: 26, emails_opened: 14, calls_made: 7, meetings_booked: 2, revenue_pipeline: 570000, revenue_closed: 162000 },
    { snapshot_date: today(), total_leads: 58, new_leads: 3, contacted_leads: 18, converted_leads: 1, emails_sent: 20, emails_opened: 10, calls_made: 4, meetings_booked: 1, revenue_pipeline: 580000, revenue_closed: 162000 },
  ];

  // Delete existing snapshots for these dates first (UNIQUE constraint)
  for (const s of snapshots) {
    await supabase.from('analytics_snapshots').delete().eq('snapshot_date', s.snapshot_date);
  }
  const { error: snapErr } = await supabase.from('analytics_snapshots').insert(snapshots);
  if (snapErr) { console.error('❌ Analytics snapshots insert failed:', snapErr.message); process.exit(1); }
  console.log('   ✅ 10 analytics snapshots inserted');

  // 13. Insert Audit Logs (10 entries)
  console.log('🔍 Inserting audit logs...');
  const auditLogs = [
    { user_id: userId, action: 'create', resource_type: 'business', resource_id: bizIds[0], old_values: null, new_values: { business_name: 'Acme Corp' }, metadata: { ip: '192.168.1.1' }, created_at: daysAgo(45) },
    { user_id: userId, action: 'update', resource_type: 'business', resource_id: bizIds[0], old_values: { status: 'new' }, new_values: { status: 'contacted' }, metadata: { ip: '192.168.1.1' }, created_at: daysAgo(40) },
    { user_id: userId, action: 'create', resource_type: 'campaign', resource_id: campIds[0], old_values: null, new_values: { name: 'Q1 Cold Outreach' }, metadata: { ip: '192.168.1.1' }, created_at: daysAgo(30) },
    { user_id: userId, action: 'update', resource_type: 'business', resource_id: bizIds[3], old_values: { status: 'proposal' }, new_values: { status: 'negotiation' }, metadata: { ip: '192.168.1.1' }, created_at: daysAgo(25) },
    { user_id: userId, action: 'create', resource_type: 'contact', resource_id: contactIds[0], old_values: null, new_values: { first_name: 'Sarah', last_name: 'Chen' }, metadata: { ip: '192.168.1.1' }, created_at: daysAgo(44) },
    { user_id: userId, action: 'update', resource_type: 'business', resource_id: bizIds[5], old_values: { status: 'negotiation' }, new_values: { status: 'won' }, metadata: { ip: '192.168.1.1', deal_value: 75000 }, created_at: daysAgo(5) },
    { user_id: userId, action: 'delete', resource_type: 'contact', resource_id: 'deleted-duplicate', old_values: { first_name: 'Old', last_name: 'Contact' }, new_values: null, metadata: { ip: '192.168.1.1', reason: 'duplicate' }, created_at: daysAgo(15) },
    { user_id: userId, action: 'create', resource_type: 'automation_rule', resource_id: ruleIds[0], old_values: null, new_values: { name: 'Welcome Email on New Lead' }, metadata: { ip: '192.168.1.1' }, created_at: daysAgo(60) },
    { user_id: userId, action: 'update', resource_type: 'profile', resource_id: userId, old_values: { subscription_tier: 'free' }, new_values: { subscription_tier: 'enterprise' }, metadata: { ip: '192.168.1.1', admin_action: true }, created_at: daysAgo(1) },
    { user_id: userId, action: 'create', resource_type: 'report', resource_id: 'report-seed', old_values: null, new_values: { name: 'Weekly Pipeline Summary' }, metadata: { ip: '192.168.1.1' }, created_at: daysAgo(30) },
  ];

  const { error: auditErr } = await supabase.from('audit_logs').insert(auditLogs);
  if (auditErr) { console.error('❌ Audit logs insert failed:', auditErr.message); process.exit(1); }
  console.log('   ✅ 10 audit logs inserted');

  // Summary
  console.log('\n🎉 Demo data seeded successfully!\n');
  console.log('Summary:');
  console.log('  • 10 businesses (leads across various industries & stages)');
  console.log('  • 10 contacts (key decision makers)');
  console.log('  • 10 activities (calls, emails, meetings, notes)');
  console.log('  • 10 campaigns (email, cold call, multi-channel, social)');
  console.log('  • 10 automation rules (scoring, assignment, notifications)');
  console.log('  • 10 reports (pipeline, source analysis, forecasts)');
  console.log('  • 10 captured emails (inbound + outbound threads)');
  console.log('  • 10 touchpoints (customer journey events)');
  console.log('  • 10 analytics snapshots (daily metrics, last 10 days)');
  console.log('  • 10 audit log entries');
  console.log('\n  Total: 100 records across 10 tables');
  console.log('\n🌐 Open http://localhost:3000 and sign in as diego.j.garnica@gmail.com');
}

seed().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
