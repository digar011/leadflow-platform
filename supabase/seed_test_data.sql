-- ============================================================
-- LeadFlow Platform - Seed Test Data
-- ============================================================
-- Run this in Supabase SQL Editor after creating your user.
-- Sets diego to enterprise tier + admin, then creates 10 entries
-- in every major table for end-to-end testing.
-- ============================================================

-- =============================================
-- 1. Set diego to admin + enterprise tier
-- =============================================
-- Temporarily disable the protect_profile_columns trigger
-- (it blocks role/tier updates when there's no JWT service_role claim)
ALTER TABLE public.profiles DISABLE TRIGGER protect_profile_columns_trigger;

UPDATE public.profiles
SET
  role = 'admin',
  subscription_tier = 'enterprise',
  subscription_billing_cycle = 'annual',
  is_active = true,
  full_name = COALESCE(full_name, 'Diego Garnica')
WHERE email = 'diego.j.garnica@gmail.com';

-- Re-enable the trigger
ALTER TABLE public.profiles ENABLE TRIGGER protect_profile_columns_trigger;

-- Store diego's user_id for subsequent inserts
DO $$
DECLARE
  v_user_id UUID;
  v_biz_ids UUID[] := ARRAY[]::UUID[];
  v_contact_ids UUID[] := ARRAY[]::UUID[];
  v_campaign_ids UUID[] := ARRAY[]::UUID[];
  v_rule_ids UUID[] := ARRAY[]::UUID[];
  v_activity_ids UUID[] := ARRAY[]::UUID[];
  v_tmp_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM public.profiles WHERE email = 'diego.j.garnica@gmail.com';

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User diego.j.garnica@gmail.com not found. Create the user first.';
  END IF;

  RAISE NOTICE 'Seeding data for user: %', v_user_id;

  -- =============================================
  -- 2. Businesses (10 leads)
  -- =============================================
  INSERT INTO public.businesses (id, business_name, business_type, industry_category, phone, email, website_url, has_website, street_address, city, state, zip_code, country, lead_score, lead_temperature, status, source, deal_value, expected_close_date, next_follow_up, tags, notes, assigned_to, created_at)
  VALUES
    (gen_random_uuid(), 'Acme Corp', 'LLC', 'Technology', '(555) 100-1001', 'info@acmecorp.com', 'https://acmecorp.com', true, '123 Main St', 'San Francisco', 'CA', '94102', 'US', 85, 'hot', 'qualified', 'website', 125000, NOW() + INTERVAL '30 days', NOW() + INTERVAL '2 days', ARRAY['enterprise','saas'], 'Key enterprise prospect. Met at SaaStr conference.', v_user_id, NOW() - INTERVAL '45 days'),
    (gen_random_uuid(), 'TechStart Inc', 'Corporation', 'SaaS', '(555) 200-2002', 'hello@techstart.io', 'https://techstart.io', true, '456 Innovation Blvd', 'Austin', 'TX', '78701', 'US', 72, 'warm', 'proposal', 'referral', 45000, NOW() + INTERVAL '14 days', NOW() + INTERVAL '1 day', ARRAY['startup','series-a'], 'Referred by John at Acme. Needs CRM integration.', v_user_id, NOW() - INTERVAL '30 days'),
    (gen_random_uuid(), 'GreenLeaf Organics', 'LLC', 'Food & Beverage', '(555) 300-3003', 'orders@greenleaf.com', 'https://greenleaf.com', true, '789 Farm Rd', 'Portland', 'OR', '97201', 'US', 60, 'warm', 'contacted', 'cold_call', 18000, NOW() + INTERVAL '60 days', NOW() + INTERVAL '5 days', ARRAY['organic','retail'], 'Interested in our marketing automation module.', v_user_id, NOW() - INTERVAL '20 days'),
    (gen_random_uuid(), 'BuildRight Construction', 'Corporation', 'Construction', '(555) 400-4004', 'bids@buildright.co', 'https://buildright.co', true, '321 Steel Ave', 'Denver', 'CO', '80202', 'US', 90, 'hot', 'negotiation', 'linkedin', 250000, NOW() + INTERVAL '7 days', NOW() + INTERVAL '1 day', ARRAY['construction','enterprise'], 'Final contract review. Legal team involved.', v_user_id, NOW() - INTERVAL '60 days'),
    (gen_random_uuid(), 'Pixel Perfect Design', 'Sole Proprietorship', 'Design', '(555) 500-5005', 'studio@pixelperfect.design', NULL, false, '555 Creative St', 'Brooklyn', 'NY', '11201', 'US', 35, 'cold', 'new', 'import', 5000, NULL, NOW() + INTERVAL '7 days', ARRAY['design','freelance'], 'Small agency, exploring CRM options.', v_user_id, NOW() - INTERVAL '3 days'),
    (gen_random_uuid(), 'CloudNine Solutions', 'LLC', 'Cloud Services', '(555) 600-6006', 'sales@cloudnine.io', 'https://cloudnine.io', true, '999 Cloud Way', 'Seattle', 'WA', '98101', 'US', 78, 'hot', 'won', 'partner', 75000, NOW() - INTERVAL '5 days', NULL, ARRAY['cloud','partner'], 'Deal closed! Onboarding scheduled for next week.', v_user_id, NOW() - INTERVAL '90 days'),
    (gen_random_uuid(), 'MediCare Plus', 'Corporation', 'Healthcare', '(555) 700-7007', 'admin@medicareplus.org', 'https://medicareplus.org', true, '777 Health Pkwy', 'Chicago', 'IL', '60601', 'US', 65, 'warm', 'qualified', 'webinar', 95000, NOW() + INTERVAL '45 days', NOW() + INTERVAL '3 days', ARRAY['healthcare','hipaa'], 'Needs HIPAA-compliant solution. Demo scheduled.', v_user_id, NOW() - INTERVAL '15 days'),
    (gen_random_uuid(), 'EduLearn Academy', 'Non-Profit', 'Education', '(555) 800-8008', 'info@edulearn.edu', 'https://edulearn.edu', true, '888 Campus Dr', 'Boston', 'MA', '02101', 'US', 45, 'cold', 'contacted', 'event', 12000, NOW() + INTERVAL '90 days', NOW() + INTERVAL '14 days', ARRAY['education','non-profit'], 'Met at EdTech conference. Budget limited.', v_user_id, NOW() - INTERVAL '10 days'),
    (gen_random_uuid(), 'FastFreight Logistics', 'LLC', 'Logistics', '(555) 900-9009', 'ops@fastfreight.com', 'https://fastfreight.com', true, '111 Dock St', 'Miami', 'FL', '33101', 'US', 55, 'warm', 'new', 'google_ads', 30000, NOW() + INTERVAL '60 days', NOW() + INTERVAL '3 days', ARRAY['logistics','fleet'], 'Inbound from Google Ads. Needs fleet management.', v_user_id, NOW() - INTERVAL '5 days'),
    (gen_random_uuid(), 'Sunset Real Estate', 'LLC', 'Real Estate', '(555) 010-0010', 'listings@sunsetrealty.com', 'https://sunsetrealty.com', true, '222 Sunset Blvd', 'Los Angeles', 'CA', '90028', 'US', 20, 'cold', 'lost', 'cold_email', 0, NULL, NULL, ARRAY['real-estate'], 'Went with competitor. May revisit in Q3.', v_user_id, NOW() - INTERVAL '120 days')
  RETURNING id INTO v_tmp_id;

  -- Collect all business IDs
  SELECT array_agg(id ORDER BY created_at) INTO v_biz_ids FROM public.businesses WHERE assigned_to = v_user_id;

  -- =============================================
  -- 3. Contacts (10 contacts across businesses)
  -- =============================================
  INSERT INTO public.contacts (business_id, first_name, last_name, title, email, phone, linkedin_url, is_primary)
  VALUES
    (v_biz_ids[1], 'Sarah', 'Chen', 'VP of Sales', 'sarah.chen@acmecorp.com', '(555) 100-1010', 'https://linkedin.com/in/sarahchen', true),
    (v_biz_ids[1], 'Mike', 'Johnson', 'CTO', 'mike.j@acmecorp.com', '(555) 100-1011', 'https://linkedin.com/in/mikejohnson', false),
    (v_biz_ids[2], 'Lisa', 'Park', 'CEO', 'lisa@techstart.io', '(555) 200-2020', 'https://linkedin.com/in/lisapark', true),
    (v_biz_ids[3], 'Tom', 'Rivera', 'Operations Manager', 'tom@greenleaf.com', '(555) 300-3030', NULL, true),
    (v_biz_ids[4], 'James', 'Wright', 'Project Director', 'james.w@buildright.co', '(555) 400-4040', 'https://linkedin.com/in/jameswright', true),
    (v_biz_ids[5], 'Emma', 'Blake', 'Owner', 'emma@pixelperfect.design', '(555) 500-5050', 'https://linkedin.com/in/emmablake', true),
    (v_biz_ids[6], 'David', 'Kim', 'Head of Partnerships', 'david.kim@cloudnine.io', '(555) 600-6060', 'https://linkedin.com/in/davidkim', true),
    (v_biz_ids[7], 'Dr. Rachel', 'Adams', 'Chief Medical Officer', 'r.adams@medicareplus.org', '(555) 700-7070', 'https://linkedin.com/in/dracheladams', true),
    (v_biz_ids[8], 'Prof. Alan', 'Torres', 'Dean of Technology', 'alan.t@edulearn.edu', '(555) 800-8080', NULL, true),
    (v_biz_ids[9], 'Carlos', 'Mendez', 'Logistics Coordinator', 'carlos@fastfreight.com', '(555) 900-9090', 'https://linkedin.com/in/carlosmendez', true)
  RETURNING id INTO v_tmp_id;

  SELECT array_agg(id ORDER BY created_at) INTO v_contact_ids FROM public.contacts WHERE business_id = ANY(v_biz_ids);

  -- =============================================
  -- 4. Activities (10 mixed types)
  -- =============================================
  INSERT INTO public.activities (business_id, contact_id, user_id, activity_type, subject, description, outcome, metadata, created_at)
  VALUES
    (v_biz_ids[1], v_contact_ids[1], v_user_id, 'email_sent', 'Follow-up: Product Demo', 'Sent detailed pricing proposal after demo call.', 'positive', '{"source":"manual"}', NOW() - INTERVAL '2 days'),
    (v_biz_ids[1], v_contact_ids[2], v_user_id, 'meeting_completed', 'Technical Deep Dive', 'Discussed API integration requirements with CTO.', 'positive', '{"duration_minutes":45}', NOW() - INTERVAL '5 days'),
    (v_biz_ids[2], v_contact_ids[3], v_user_id, 'call_outbound', 'Discovery Call', 'Initial call with Lisa. They need 5 seats.', 'positive', '{"duration_minutes":30}', NOW() - INTERVAL '8 days'),
    (v_biz_ids[3], v_contact_ids[4], v_user_id, 'email_received', 'RE: Pricing Question', 'Tom asked about volume discounts for 20+ users.', NULL, '{"source":"email_capture"}', NOW() - INTERVAL '1 day'),
    (v_biz_ids[4], v_contact_ids[5], v_user_id, 'note', 'Contract Review Notes', 'Legal team has minor concerns about SLA terms. Need to revise section 4.2.', NULL, '{}', NOW() - INTERVAL '3 days'),
    (v_biz_ids[5], v_contact_ids[6], v_user_id, 'email_sent', 'Welcome & Getting Started', 'Sent onboarding materials and setup guide.', 'positive', '{"template":"welcome"}', NOW() - INTERVAL '10 days'),
    (v_biz_ids[6], v_contact_ids[7], v_user_id, 'meeting_scheduled', 'Onboarding Kickoff', 'Scheduled onboarding session for next Monday.', NULL, '{"scheduled_for":"2026-02-16T10:00:00Z"}', NOW() - INTERVAL '1 day'),
    (v_biz_ids[7], v_contact_ids[8], v_user_id, 'call_inbound', 'Compliance Questions', 'Dr. Adams called with HIPAA compliance questions. Forwarded to security team.', 'neutral', '{"duration_minutes":20}', NOW() - INTERVAL '4 days'),
    (v_biz_ids[8], v_contact_ids[9], v_user_id, 'status_change', 'Status: New → Contacted', 'Moved to contacted after initial outreach email.', NULL, '{"old_status":"new","new_status":"contacted"}', NOW() - INTERVAL '7 days'),
    (v_biz_ids[9], v_contact_ids[10], v_user_id, 'task_completed', 'Prepare Custom Proposal', 'Completed custom fleet management proposal for FastFreight.', 'positive', '{}', NOW() - INTERVAL '2 days')
  RETURNING id INTO v_tmp_id;

  SELECT array_agg(id ORDER BY created_at) INTO v_activity_ids FROM public.activities WHERE user_id = v_user_id ORDER BY created_at DESC LIMIT 10;

  -- =============================================
  -- 5. Campaigns (10 campaigns)
  -- =============================================
  INSERT INTO public.campaigns (id, name, description, campaign_type, status, budget, started_at, ended_at, created_by, created_at)
  VALUES
    (gen_random_uuid(), 'Q1 Cold Outreach', 'Email outreach to new prospects from LinkedIn scraping', 'email', 'active', 5000, NOW() - INTERVAL '30 days', NULL, v_user_id, NOW() - INTERVAL '30 days'),
    (gen_random_uuid(), 'SaaS Decision Makers', 'Targeted campaign for SaaS company CTOs and VPs', 'cold_call', 'active', 8000, NOW() - INTERVAL '20 days', NULL, v_user_id, NOW() - INTERVAL '20 days'),
    (gen_random_uuid(), 'Partner Referral Program', 'Multi-channel campaign for partner referral leads', 'multi_channel', 'active', 12000, NOW() - INTERVAL '45 days', NULL, v_user_id, NOW() - INTERVAL '45 days'),
    (gen_random_uuid(), 'Healthcare Vertical Push', 'Targeted outreach to healthcare organizations', 'email', 'draft', 15000, NULL, NULL, v_user_id, NOW() - INTERVAL '5 days'),
    (gen_random_uuid(), 'Re-engagement Campaign', 'Win-back campaign for lost/cold leads', 'email', 'paused', 3000, NOW() - INTERVAL '60 days', NULL, v_user_id, NOW() - INTERVAL '60 days'),
    (gen_random_uuid(), 'Webinar Follow-up', 'Follow-up sequence for webinar attendees', 'email', 'completed', 2000, NOW() - INTERVAL '90 days', NOW() - INTERVAL '60 days', v_user_id, NOW() - INTERVAL '90 days'),
    (gen_random_uuid(), 'Direct Mail - Enterprise', 'Physical mailer campaign for enterprise prospects', 'mailer', 'draft', 20000, NULL, NULL, v_user_id, NOW() - INTERVAL '2 days'),
    (gen_random_uuid(), 'Social Media Blitz', 'LinkedIn + Twitter outreach for brand awareness', 'social', 'active', 6000, NOW() - INTERVAL '15 days', NULL, v_user_id, NOW() - INTERVAL '15 days'),
    (gen_random_uuid(), 'Product Launch Announce', 'New feature announcement to existing pipeline', 'email', 'completed', 1000, NOW() - INTERVAL '40 days', NOW() - INTERVAL '35 days', v_user_id, NOW() - INTERVAL '40 days'),
    (gen_random_uuid(), 'Q2 Pipeline Accelerator', 'Aggressive outreach to move deals forward', 'multi_channel', 'draft', 25000, NULL, NULL, v_user_id, NOW() - INTERVAL '1 day')
  RETURNING id INTO v_tmp_id;

  SELECT array_agg(id ORDER BY created_at) INTO v_campaign_ids FROM public.campaigns WHERE created_by = v_user_id;

  -- =============================================
  -- 6. Automation Rules (10 rules)
  -- =============================================
  INSERT INTO public.automation_rules (name, description, trigger_type, trigger_config, action_type, action_config, is_active, priority, created_by, created_at)
  VALUES
    ('Welcome Email on New Lead', 'Send welcome email when a new lead is created', 'lead_created', '{}', 'send_email', '{"template":"welcome","subject":"Welcome to LeadFlow!"}', true, 1, v_user_id, NOW() - INTERVAL '60 days'),
    ('Auto-assign to Sales Rep', 'Assign hot leads to senior sales rep', 'lead_created', '{"temperature":"hot"}', 'assign_user', '{"assign_to":"round_robin"}', true, 2, v_user_id, NOW() - INTERVAL '55 days'),
    ('Score Boost on Email Open', 'Increase lead score by 5 when email is opened', 'lead_updated', '{"field":"email_opened"}', 'update_score', '{"increment":5}', true, 3, v_user_id, NOW() - INTERVAL '50 days'),
    ('Follow-up Reminder', 'Create task when lead is inactive for 7 days', 'inactivity', '{"days":7}', 'create_task', '{"title":"Follow up with inactive lead","priority":"high"}', true, 4, v_user_id, NOW() - INTERVAL '45 days'),
    ('Move to Qualified on Score 70+', 'Auto-qualify leads with score above 70', 'score_threshold', '{"threshold":70,"direction":"above"}', 'update_status', '{"status":"qualified"}', true, 5, v_user_id, NOW() - INTERVAL '40 days'),
    ('Add to Campaign on Import', 'Auto-add imported leads to Q1 outreach', 'lead_created', '{"source":"import"}', 'add_to_campaign', '{"campaign":"Q1 Cold Outreach"}', false, 6, v_user_id, NOW() - INTERVAL '35 days'),
    ('Webhook on Deal Won', 'Send webhook notification when deal is won', 'status_changed', '{"to":"won"}', 'send_webhook', '{"url":"https://hooks.slack.com/example"}', true, 7, v_user_id, NOW() - INTERVAL '30 days'),
    ('Tag Hot Leads', 'Add "priority" tag when temperature changes to hot', 'lead_updated', '{"field":"lead_temperature","value":"hot"}', 'add_tag', '{"tag":"priority"}', true, 8, v_user_id, NOW() - INTERVAL '25 days'),
    ('Birthday Email', 'Send birthday greeting on contact birthday', 'date_based', '{"field":"birthday","offset_days":0}', 'send_email', '{"template":"birthday"}', false, 9, v_user_id, NOW() - INTERVAL '20 days'),
    ('Escalate Stale Proposals', 'Notify manager when proposal is stale for 14 days', 'inactivity', '{"days":14,"status":"proposal"}', 'create_task', '{"title":"Escalate stale proposal","assign_to":"manager"}', true, 10, v_user_id, NOW() - INTERVAL '15 days')
  RETURNING id INTO v_tmp_id;

  SELECT array_agg(id ORDER BY created_at) INTO v_rule_ids FROM public.automation_rules WHERE created_by = v_user_id;

  -- =============================================
  -- 7. Reports (10 saved reports)
  -- =============================================
  INSERT INTO public.reports (name, description, report_type, filters, columns, schedule, created_by, created_at)
  VALUES
    ('Weekly Pipeline Summary', 'Overview of pipeline by status and deal value', 'pipeline', '{"date_range":"last_7_days"}', '["status","count","deal_value"]', 'weekly', v_user_id, NOW() - INTERVAL '30 days'),
    ('Monthly Lead Source Analysis', 'Breakdown of leads by acquisition source', 'source', '{"date_range":"last_30_days"}', '["source","count","conversion_rate"]', 'monthly', v_user_id, NOW() - INTERVAL '28 days'),
    ('Hot Leads Report', 'All leads with temperature = hot', 'leads', '{"temperature":"hot"}', '["business_name","score","deal_value","status"]', NULL, v_user_id, NOW() - INTERVAL '25 days'),
    ('Activity Log - This Week', 'All activities logged this week', 'activity', '{"date_range":"this_week"}', '["type","subject","business","date"]', 'weekly', v_user_id, NOW() - INTERVAL '20 days'),
    ('Campaign Performance', 'ROI and conversion metrics for all campaigns', 'campaign', '{"status":"active"}', '["name","budget","leads","conversions","roi"]', 'monthly', v_user_id, NOW() - INTERVAL '18 days'),
    ('Stale Deals (30+ days)', 'Deals in proposal/negotiation for 30+ days', 'pipeline', '{"stale_days":30,"status":["proposal","negotiation"]}', '["business_name","status","days_stale","deal_value"]', NULL, v_user_id, NOW() - INTERVAL '15 days'),
    ('Team Activity Scorecard', 'Activities per team member this month', 'team', '{"date_range":"this_month"}', '["user","calls","emails","meetings","deals_won"]', 'monthly', v_user_id, NOW() - INTERVAL '12 days'),
    ('Revenue Forecast', 'Expected revenue by close date', 'forecast', '{"date_range":"next_90_days"}', '["month","expected_revenue","weighted_revenue","deal_count"]', NULL, v_user_id, NOW() - INTERVAL '10 days'),
    ('Lost Deal Analysis', 'Reasons and patterns in lost deals', 'leads', '{"status":"lost"}', '["business_name","source","deal_value","days_in_pipeline","notes"]', NULL, v_user_id, NOW() - INTERVAL '7 days'),
    ('New Leads This Week', 'Leads created in the last 7 days', 'leads', '{"date_range":"last_7_days","status":"new"}', '["business_name","source","score","created_at"]', 'weekly', v_user_id, NOW() - INTERVAL '3 days');

  -- =============================================
  -- 8. Captured Emails (10 entries)
  -- =============================================
  INSERT INTO public.captured_emails (user_id, business_id, direction, from_address, to_addresses, cc_addresses, subject, body_snippet, message_id, matched, created_at)
  VALUES
    (v_user_id, v_biz_ids[1], 'outbound', 'diego.j.garnica@gmail.com', ARRAY['sarah.chen@acmecorp.com'], ARRAY[]::TEXT[], 'Re: Product Demo Follow-up', 'Hi Sarah, great speaking with you today. As discussed, here is our pricing proposal...', '<msg001@mail.leadflow.app>', true, NOW() - INTERVAL '2 days'),
    (v_user_id, v_biz_ids[1], 'inbound', 'sarah.chen@acmecorp.com', ARRAY['diego.j.garnica@gmail.com'], ARRAY[]::TEXT[], 'Re: Product Demo Follow-up', 'Thanks Diego! I have shared this with our procurement team. We should have feedback by...', '<msg002@mail.acmecorp.com>', true, NOW() - INTERVAL '1 day'),
    (v_user_id, v_biz_ids[2], 'outbound', 'diego.j.garnica@gmail.com', ARRAY['lisa@techstart.io'], ARRAY[]::TEXT[], 'Partnership Opportunity', 'Hi Lisa, I wanted to reach out about a potential partnership between our platforms...', '<msg003@mail.leadflow.app>', true, NOW() - INTERVAL '8 days'),
    (v_user_id, v_biz_ids[3], 'inbound', 'tom@greenleaf.com', ARRAY['diego.j.garnica@gmail.com'], ARRAY[]::TEXT[], 'Volume Discount Inquiry', 'Hello, we are looking at onboarding 20+ team members. Do you offer volume discounts?', '<msg004@mail.greenleaf.com>', true, NOW() - INTERVAL '1 day'),
    (v_user_id, v_biz_ids[4], 'outbound', 'diego.j.garnica@gmail.com', ARRAY['james.w@buildright.co'], ARRAY['legal@buildright.co'], 'Updated Contract - Section 4.2 Revised', 'James, please find the updated contract with revised SLA terms in section 4.2...', '<msg005@mail.leadflow.app>', true, NOW() - INTERVAL '3 days'),
    (v_user_id, NULL, 'inbound', 'unknown@randomcompany.com', ARRAY['diego.j.garnica@gmail.com'], ARRAY[]::TEXT[], 'Interested in your CRM', 'Hi, I found your product online and would like to learn more about pricing...', '<msg006@mail.random.com>', false, NOW() - INTERVAL '6 days'),
    (v_user_id, v_biz_ids[6], 'outbound', 'diego.j.garnica@gmail.com', ARRAY['david.kim@cloudnine.io'], ARRAY[]::TEXT[], 'Onboarding Schedule', 'David, confirming our onboarding kickoff for Monday at 10am PST...', '<msg007@mail.leadflow.app>', true, NOW() - INTERVAL '1 day'),
    (v_user_id, v_biz_ids[7], 'inbound', 'r.adams@medicareplus.org', ARRAY['diego.j.garnica@gmail.com'], ARRAY['compliance@medicareplus.org'], 'HIPAA Compliance Documentation', 'Diego, could you please provide your SOC2 and HIPAA compliance documentation?', '<msg008@mail.medicareplus.org>', true, NOW() - INTERVAL '4 days'),
    (v_user_id, NULL, 'inbound', 'newsletter@saasweekly.com', ARRAY['diego.j.garnica@gmail.com'], ARRAY[]::TEXT[], 'SaaS Weekly Newsletter #142', 'This week in SaaS: Top CRM trends for 2026...', '<msg009@mail.saasweekly.com>', false, NOW() - INTERVAL '2 days'),
    (v_user_id, v_biz_ids[9], 'outbound', 'diego.j.garnica@gmail.com', ARRAY['carlos@fastfreight.com'], ARRAY[]::TEXT[], 'Custom Fleet Management Proposal', 'Carlos, attached is our custom proposal for FastFreight fleet management integration...', '<msg010@mail.leadflow.app>', true, NOW() - INTERVAL '2 days');

  -- =============================================
  -- 9. Touchpoints (10 customer journey points)
  -- =============================================
  INSERT INTO public.touchpoints (business_id, contact_id, type, source, campaign_id, metadata, occurred_at)
  VALUES
    (v_biz_ids[1], v_contact_ids[1], 'website_visit', 'organic', NULL, '{"page":"/pricing","duration_seconds":120}', NOW() - INTERVAL '50 days'),
    (v_biz_ids[1], v_contact_ids[1], 'form_submit', 'organic', NULL, '{"form":"demo_request","fields":["name","email","company"]}', NOW() - INTERVAL '48 days'),
    (v_biz_ids[2], v_contact_ids[3], 'email_open', 'campaign', v_campaign_ids[1], '{"subject":"Q1 Outreach"}', NOW() - INTERVAL '25 days'),
    (v_biz_ids[2], v_contact_ids[3], 'email_click', 'campaign', v_campaign_ids[1], '{"link":"/pricing"}', NOW() - INTERVAL '25 days'),
    (v_biz_ids[3], v_contact_ids[4], 'call', 'outbound', NULL, '{"duration_minutes":15,"outcome":"interested"}', NOW() - INTERVAL '18 days'),
    (v_biz_ids[4], v_contact_ids[5], 'meeting', 'referral', NULL, '{"type":"video","duration_minutes":60}', NOW() - INTERVAL '30 days'),
    (v_biz_ids[5], v_contact_ids[6], 'ad_click', 'google_ads', NULL, '{"campaign":"CRM Tools 2026","cost":2.50}', NOW() - INTERVAL '5 days'),
    (v_biz_ids[7], v_contact_ids[8], 'website_visit', 'webinar', v_campaign_ids[6], '{"page":"/healthcare","duration_seconds":300}', NOW() - INTERVAL '16 days'),
    (v_biz_ids[8], v_contact_ids[9], 'social_interaction', 'linkedin', NULL, '{"type":"comment","post_id":"12345"}', NOW() - INTERVAL '12 days'),
    (v_biz_ids[9], v_contact_ids[10], 'form_submit', 'google_ads', NULL, '{"form":"contact_us","fields":["name","email","fleet_size"]}', NOW() - INTERVAL '5 days');

  -- =============================================
  -- 10. Analytics Snapshots (10 daily snapshots)
  -- =============================================
  INSERT INTO public.analytics_snapshots (snapshot_date, total_leads, new_leads, contacted_leads, converted_leads, emails_sent, emails_opened, calls_made, meetings_booked, revenue_pipeline, revenue_closed)
  VALUES
    ((NOW() - INTERVAL '9 days')::DATE, 42, 5, 12, 3, 28, 14, 8, 3, 450000, 75000),
    ((NOW() - INTERVAL '8 days')::DATE, 44, 3, 13, 1, 32, 18, 6, 2, 465000, 75000),
    ((NOW() - INTERVAL '7 days')::DATE, 45, 2, 14, 2, 25, 12, 10, 4, 480000, 87000),
    ((NOW() - INTERVAL '6 days')::DATE, 47, 4, 14, 1, 30, 16, 7, 3, 495000, 87000),
    ((NOW() - INTERVAL '5 days')::DATE, 48, 2, 15, 2, 22, 11, 5, 1, 510000, 112000),
    ((NOW() - INTERVAL '4 days')::DATE, 50, 3, 16, 1, 35, 20, 9, 4, 525000, 112000),
    ((NOW() - INTERVAL '3 days')::DATE, 52, 4, 16, 3, 28, 15, 8, 2, 540000, 150000),
    ((NOW() - INTERVAL '2 days')::DATE, 54, 3, 17, 1, 31, 17, 6, 3, 555000, 150000),
    ((NOW() - INTERVAL '1 day')::DATE, 56, 5, 18, 2, 26, 14, 7, 2, 570000, 162000),
    (NOW()::DATE, 58, 3, 18, 1, 20, 10, 4, 1, 580000, 162000);

  -- =============================================
  -- 11. Audit Logs (10 entries)
  -- =============================================
  INSERT INTO public.audit_logs (user_id, action, resource_type, resource_id, old_values, new_values, metadata, created_at)
  VALUES
    (v_user_id, 'create', 'business', v_biz_ids[1]::TEXT, NULL, '{"business_name":"Acme Corp"}', '{"ip":"192.168.1.1"}', NOW() - INTERVAL '45 days'),
    (v_user_id, 'update', 'business', v_biz_ids[1]::TEXT, '{"status":"new"}', '{"status":"contacted"}', '{"ip":"192.168.1.1"}', NOW() - INTERVAL '40 days'),
    (v_user_id, 'create', 'campaign', v_campaign_ids[1]::TEXT, NULL, '{"name":"Q1 Cold Outreach"}', '{"ip":"192.168.1.1"}', NOW() - INTERVAL '30 days'),
    (v_user_id, 'update', 'business', v_biz_ids[4]::TEXT, '{"status":"proposal"}', '{"status":"negotiation"}', '{"ip":"192.168.1.1"}', NOW() - INTERVAL '25 days'),
    (v_user_id, 'create', 'contact', v_contact_ids[1]::TEXT, NULL, '{"first_name":"Sarah","last_name":"Chen"}', '{"ip":"192.168.1.1"}', NOW() - INTERVAL '44 days'),
    (v_user_id, 'update', 'business', v_biz_ids[6]::TEXT, '{"status":"negotiation"}', '{"status":"won"}', '{"ip":"192.168.1.1","deal_value":75000}', NOW() - INTERVAL '5 days'),
    (v_user_id, 'delete', 'contact', gen_random_uuid()::TEXT, '{"first_name":"Old","last_name":"Contact"}', NULL, '{"ip":"192.168.1.1","reason":"duplicate"}', NOW() - INTERVAL '15 days'),
    (v_user_id, 'create', 'automation_rule', v_rule_ids[1]::TEXT, NULL, '{"name":"Welcome Email on New Lead"}', '{"ip":"192.168.1.1"}', NOW() - INTERVAL '60 days'),
    (v_user_id, 'update', 'profile', v_user_id::TEXT, '{"subscription_tier":"free"}', '{"subscription_tier":"enterprise"}', '{"ip":"192.168.1.1","admin_action":true}', NOW() - INTERVAL '1 day'),
    (v_user_id, 'create', 'report', gen_random_uuid()::TEXT, NULL, '{"name":"Weekly Pipeline Summary"}', '{"ip":"192.168.1.1"}', NOW() - INTERVAL '30 days');

  RAISE NOTICE 'Seed data created successfully!';
  RAISE NOTICE 'Businesses: 10, Contacts: 10, Activities: 10, Campaigns: 10';
  RAISE NOTICE 'Automation Rules: 10, Reports: 10, Captured Emails: 10';
  RAISE NOTICE 'Touchpoints: 10, Analytics Snapshots: 10, Audit Logs: 10';

END $$;
