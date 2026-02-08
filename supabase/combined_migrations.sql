-- ============================================================
-- LeadFlow Platform - Combined Migrations
-- Run this script in Supabase SQL Editor to set up all tables
-- ============================================================

-- ============================================================
-- Migration: 0001_profiles
-- Description: User profiles table extending auth.users
-- ============================================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin', 'manager', 'user')) DEFAULT 'user',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_sign_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- Migration: 0002_businesses
-- Description: Main leads/businesses table with 40+ fields
-- ============================================================

-- Create businesses (leads) table
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  business_name TEXT NOT NULL,
  business_type TEXT,
  industry_category TEXT,

  -- Contact Info
  phone TEXT,
  email TEXT,
  website_url TEXT,
  has_website BOOLEAN DEFAULT false,

  -- Address
  street_address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'US',
  latitude DECIMAL,
  longitude DECIMAL,

  -- Social Media
  linkedin_url TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  twitter_url TEXT,
  youtube_url TEXT,
  tiktok_url TEXT,

  -- Google Business Profile
  google_place_id TEXT,
  google_rating DECIMAL,
  google_review_count INTEGER,
  google_maps_url TEXT,

  -- Website Analysis
  website_score INTEGER CHECK (website_score >= 0 AND website_score <= 100),
  seo_score INTEGER CHECK (seo_score >= 0 AND seo_score <= 100),
  speed_score INTEGER CHECK (speed_score >= 0 AND speed_score <= 100),
  mobile_friendly BOOLEAN,
  has_ssl BOOLEAN,
  last_website_check TIMESTAMPTZ,

  -- Lead Scoring
  lead_score INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
  lead_temperature TEXT DEFAULT 'cold' CHECK (lead_temperature IN ('cold', 'warm', 'hot')),

  -- Status Tracking
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost', 'do_not_contact')),
  assigned_to UUID REFERENCES public.profiles(id),

  -- Source Tracking
  source TEXT,
  scraped_at TIMESTAMPTZ,

  -- Deal Info
  deal_value DECIMAL(15, 2),
  expected_close_date DATE,

  -- Metadata
  tags TEXT[],
  notes TEXT,
  custom_fields JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_businesses_status ON public.businesses(status);
CREATE INDEX IF NOT EXISTS idx_businesses_assigned ON public.businesses(assigned_to);
CREATE INDEX IF NOT EXISTS idx_businesses_created ON public.businesses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_businesses_temperature ON public.businesses(lead_temperature);
CREATE INDEX IF NOT EXISTS idx_businesses_score ON public.businesses(lead_score DESC);
CREATE INDEX IF NOT EXISTS idx_businesses_source ON public.businesses(source);
CREATE INDEX IF NOT EXISTS idx_businesses_city ON public.businesses(city);
CREATE INDEX IF NOT EXISTS idx_businesses_industry ON public.businesses(industry_category);
CREATE INDEX IF NOT EXISTS idx_businesses_name ON public.businesses(business_name);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_businesses_search ON public.businesses
  USING GIN (to_tsvector('english', COALESCE(business_name, '') || ' ' || COALESCE(city, '') || ' ' || COALESCE(notes, '')));

-- Enable Row Level Security
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view businesses" ON public.businesses;
DROP POLICY IF EXISTS "Authenticated users can insert businesses" ON public.businesses;
DROP POLICY IF EXISTS "Users can update assigned businesses" ON public.businesses;
DROP POLICY IF EXISTS "Admins can delete businesses" ON public.businesses;

-- RLS Policies for businesses
CREATE POLICY "Authenticated users can view businesses" ON public.businesses
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert businesses" ON public.businesses
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update assigned businesses" ON public.businesses
  FOR UPDATE
  USING (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete businesses" ON public.businesses
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS businesses_updated_at ON public.businesses;
CREATE TRIGGER businesses_updated_at
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- Migration: 0003_contacts
-- Description: Contacts table for people at businesses
-- ============================================================

-- Create contacts table
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,

  -- Personal Info
  first_name TEXT,
  last_name TEXT,
  title TEXT,
  department TEXT,

  -- Contact Info
  email TEXT,
  phone TEXT,
  mobile_phone TEXT,

  -- Social
  linkedin_url TEXT,
  twitter_url TEXT,

  -- Relationship
  is_primary BOOLEAN DEFAULT false,
  relationship_type TEXT CHECK (relationship_type IN ('decision_maker', 'influencer', 'gatekeeper', 'end_user', 'other')),

  -- Notes
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_contacts_business ON public.contacts(business_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON public.contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_primary ON public.contacts(is_primary) WHERE is_primary = true;
CREATE INDEX IF NOT EXISTS idx_contacts_name ON public.contacts(first_name, last_name);

-- Enable Row Level Security
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view contacts" ON public.contacts;
DROP POLICY IF EXISTS "Authenticated users can insert contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can update contacts" ON public.contacts;
DROP POLICY IF EXISTS "Admins can delete contacts" ON public.contacts;

-- RLS Policies for contacts
CREATE POLICY "Authenticated users can view contacts" ON public.contacts
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert contacts" ON public.contacts
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update contacts" ON public.contacts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = contacts.business_id
      AND (b.assigned_to = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      ))
    )
  );

CREATE POLICY "Admins can delete contacts" ON public.contacts
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS contacts_updated_at ON public.contacts;
CREATE TRIGGER contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to ensure only one primary contact per business
CREATE OR REPLACE FUNCTION public.ensure_single_primary_contact()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary = true THEN
    UPDATE public.contacts
    SET is_primary = false
    WHERE business_id = NEW.business_id
    AND id != NEW.id
    AND is_primary = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce single primary contact
DROP TRIGGER IF EXISTS ensure_single_primary ON public.contacts;
CREATE TRIGGER ensure_single_primary
  BEFORE INSERT OR UPDATE ON public.contacts
  FOR EACH ROW
  WHEN (NEW.is_primary = true)
  EXECUTE FUNCTION public.ensure_single_primary_contact();

-- ============================================================
-- Migration: 0004_activities
-- Description: Activities table for all interactions
-- ============================================================

-- Create activities table
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id),

  -- Activity Details
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'email_sent', 'email_received', 'email_opened', 'email_clicked',
    'call_outbound', 'call_inbound', 'call_voicemail',
    'sms_sent', 'sms_received',
    'meeting_scheduled', 'meeting_completed',
    'mailer_sent',
    'social_dm', 'social_comment',
    'landing_page_visit', 'landing_page_conversion',
    'note', 'status_change', 'task_completed'
  )),

  -- Content
  subject TEXT,
  description TEXT,
  outcome TEXT CHECK (outcome IN ('positive', 'negative', 'neutral', 'pending') OR outcome IS NULL),

  -- Scheduling
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_minutes INTEGER,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_activities_business ON public.activities(business_id);
CREATE INDEX IF NOT EXISTS idx_activities_contact ON public.activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_activities_user ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON public.activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_created ON public.activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_scheduled ON public.activities(scheduled_at) WHERE scheduled_at IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view activities" ON public.activities;
DROP POLICY IF EXISTS "Authenticated users can insert activities" ON public.activities;
DROP POLICY IF EXISTS "Users can update own activities" ON public.activities;
DROP POLICY IF EXISTS "Admins can delete activities" ON public.activities;

-- RLS Policies for activities
CREATE POLICY "Authenticated users can view activities" ON public.activities
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert activities" ON public.activities
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own activities" ON public.activities
  FOR UPDATE
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete activities" ON public.activities
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to update business last activity date
CREATE OR REPLACE FUNCTION public.update_business_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.businesses
  SET updated_at = NOW()
  WHERE id = NEW.business_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update business on new activity
DROP TRIGGER IF EXISTS update_business_on_activity ON public.activities;
CREATE TRIGGER update_business_on_activity
  AFTER INSERT ON public.activities
  FOR EACH ROW EXECUTE FUNCTION public.update_business_last_activity();

-- ============================================================
-- Migration: 0005_touchpoints
-- Description: Customer journey touchpoints for 360-degree view
-- ============================================================

-- Create touchpoints table
CREATE TABLE IF NOT EXISTS public.touchpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,

  -- Touchpoint Type
  type TEXT NOT NULL CHECK (type IN (
    'website_visit', 'email_open', 'email_click', 'form_submit',
    'call', 'meeting', 'social_interaction', 'ad_click',
    'content_download', 'webinar_attendance', 'event_attendance'
  )),

  -- Source Attribution
  source TEXT,
  campaign_id UUID,
  landing_page_id UUID,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,

  -- Details
  metadata JSONB DEFAULT '{}',
  page_url TEXT,
  referrer_url TEXT,
  ip_address TEXT,
  user_agent TEXT,
  device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'other') OR device_type IS NULL),

  -- Engagement Metrics
  engagement_score INTEGER DEFAULT 0,
  time_on_page INTEGER, -- in seconds

  -- Timestamps
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_touchpoints_business ON public.touchpoints(business_id);
CREATE INDEX IF NOT EXISTS idx_touchpoints_contact ON public.touchpoints(contact_id);
CREATE INDEX IF NOT EXISTS idx_touchpoints_type ON public.touchpoints(type);
CREATE INDEX IF NOT EXISTS idx_touchpoints_campaign ON public.touchpoints(campaign_id);
CREATE INDEX IF NOT EXISTS idx_touchpoints_occurred ON public.touchpoints(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_touchpoints_source ON public.touchpoints(source);

-- Enable Row Level Security
ALTER TABLE public.touchpoints ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view touchpoints" ON public.touchpoints;
DROP POLICY IF EXISTS "Authenticated users can insert touchpoints" ON public.touchpoints;
DROP POLICY IF EXISTS "Admins can update touchpoints" ON public.touchpoints;
DROP POLICY IF EXISTS "Admins can delete touchpoints" ON public.touchpoints;

-- RLS Policies
CREATE POLICY "Authenticated users can view touchpoints" ON public.touchpoints
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert touchpoints" ON public.touchpoints
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update touchpoints" ON public.touchpoints
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete touchpoints" ON public.touchpoints
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- Migration: 0006_campaigns
-- Description: Marketing campaigns table
-- ============================================================

-- Create campaigns table
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT CHECK (campaign_type IN ('email', 'cold_call', 'mailer', 'social', 'multi_channel', 'ads', 'content', 'event')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),

  -- Targeting
  target_criteria JSONB DEFAULT '{}',
  target_count INTEGER DEFAULT 0,

  -- Budget & Goals
  budget DECIMAL(15, 2),
  spent DECIMAL(15, 2) DEFAULT 0,
  goal_type TEXT CHECK (goal_type IN ('leads', 'meetings', 'revenue', 'engagement') OR goal_type IS NULL),
  goal_value DECIMAL(15, 2),

  -- Performance Metrics
  leads_generated INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue_generated DECIMAL(15, 2) DEFAULT 0,
  open_rate DECIMAL(5, 2),
  click_rate DECIMAL(5, 2),
  response_rate DECIMAL(5, 2),

  -- Dates
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,

  -- Ownership
  created_by UUID REFERENCES public.profiles(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create campaign_members junction table
CREATE TABLE IF NOT EXISTS public.campaign_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'opened', 'clicked', 'responded', 'converted', 'unsubscribed')),
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, business_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON public.campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON public.campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_campaigns_started ON public.campaigns(started_at);
CREATE INDEX IF NOT EXISTS idx_campaign_members_campaign ON public.campaign_members(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_members_business ON public.campaign_members(business_id);
CREATE INDEX IF NOT EXISTS idx_campaign_members_status ON public.campaign_members(status);

-- Enable Row Level Security
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Authenticated users can insert campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can update own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Admins can delete campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Authenticated users can view campaign members" ON public.campaign_members;
DROP POLICY IF EXISTS "Authenticated users can manage campaign members" ON public.campaign_members;

-- RLS Policies for campaigns
CREATE POLICY "Authenticated users can view campaigns" ON public.campaigns
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert campaigns" ON public.campaigns
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own campaigns" ON public.campaigns
  FOR UPDATE
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete campaigns" ON public.campaigns
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for campaign_members
CREATE POLICY "Authenticated users can view campaign members" ON public.campaign_members
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage campaign members" ON public.campaign_members
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS campaigns_updated_at ON public.campaigns;
CREATE TRIGGER campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- Migration: 0007_automation_rules
-- Description: Workflow automation rules table
-- ============================================================

-- Create automation_rules table
CREATE TABLE IF NOT EXISTS public.automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  name TEXT NOT NULL,
  description TEXT,

  -- Trigger Configuration
  trigger_type TEXT NOT NULL CHECK (trigger_type IN (
    'lead_created', 'lead_updated', 'status_changed',
    'score_threshold', 'inactivity', 'date_based', 'form_submission',
    'email_opened', 'email_clicked', 'meeting_scheduled'
  )),
  trigger_config JSONB DEFAULT '{}',

  -- Action Configuration
  action_type TEXT NOT NULL CHECK (action_type IN (
    'send_email', 'create_task', 'assign_user', 'update_status',
    'update_score', 'add_to_campaign', 'send_webhook', 'add_tag',
    'send_notification', 'create_activity'
  )),
  action_config JSONB DEFAULT '{}',

  -- Conditions
  conditions JSONB DEFAULT '[]',

  -- Status
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 50 CHECK (priority >= 1 AND priority <= 100),

  -- Execution Stats
  last_triggered_at TIMESTAMPTZ,
  trigger_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,

  -- Ownership
  created_by UUID REFERENCES public.profiles(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create automation_logs table for tracking executions
CREATE TABLE IF NOT EXISTS public.automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID NOT NULL REFERENCES public.automation_rules(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,

  -- Execution Details
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'success', 'failed', 'skipped')),
  trigger_data JSONB DEFAULT '{}',
  action_result JSONB DEFAULT '{}',
  error_message TEXT,

  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create scheduled_tasks table for delayed/scheduled automation actions
CREATE TABLE IF NOT EXISTS public.scheduled_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES public.automation_rules(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,

  -- Task Details
  task_type TEXT NOT NULL,
  task_config JSONB DEFAULT '{}',

  -- Scheduling
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),

  -- Execution
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_attempt_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_automation_rules_active ON public.automation_rules(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_automation_rules_trigger ON public.automation_rules(trigger_type);
CREATE INDEX IF NOT EXISTS idx_automation_rules_priority ON public.automation_rules(priority DESC);
CREATE INDEX IF NOT EXISTS idx_automation_logs_rule ON public.automation_logs(rule_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_business ON public.automation_logs(business_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_status ON public.automation_logs(status);
CREATE INDEX IF NOT EXISTS idx_automation_logs_created ON public.automation_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_scheduled ON public.scheduled_tasks(scheduled_for) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_status ON public.scheduled_tasks(status);

-- Enable Row Level Security
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view automation rules" ON public.automation_rules;
DROP POLICY IF EXISTS "Admins can manage automation rules" ON public.automation_rules;
DROP POLICY IF EXISTS "Authenticated users can view automation logs" ON public.automation_logs;
DROP POLICY IF EXISTS "System can insert automation logs" ON public.automation_logs;
DROP POLICY IF EXISTS "Authenticated users can view scheduled tasks" ON public.scheduled_tasks;
DROP POLICY IF EXISTS "System can manage scheduled tasks" ON public.scheduled_tasks;

-- RLS Policies for automation_rules
CREATE POLICY "Authenticated users can view automation rules" ON public.automation_rules
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage automation rules" ON public.automation_rules
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for automation_logs
CREATE POLICY "Authenticated users can view automation logs" ON public.automation_logs
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert automation logs" ON public.automation_logs
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for scheduled_tasks
CREATE POLICY "Authenticated users can view scheduled tasks" ON public.scheduled_tasks
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "System can manage scheduled tasks" ON public.scheduled_tasks
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS automation_rules_updated_at ON public.automation_rules;
CREATE TRIGGER automation_rules_updated_at
  BEFORE UPDATE ON public.automation_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- Migration: 0008_reports
-- Description: Reports and analytics tables
-- ============================================================

-- Create reports table (saved report configurations)
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  name TEXT NOT NULL,
  description TEXT,
  report_type TEXT NOT NULL CHECK (report_type IN ('leads', 'activities', 'campaigns', 'pipeline', 'team', 'custom', 'journey')),

  -- Configuration
  filters JSONB DEFAULT '{}',
  columns JSONB DEFAULT '[]',
  grouping JSONB,
  sorting JSONB,
  chart_type TEXT CHECK (chart_type IN ('bar', 'line', 'pie', 'funnel', 'table', 'heatmap') OR chart_type IS NULL),

  -- Scheduling
  schedule TEXT CHECK (schedule IN ('daily', 'weekly', 'monthly', 'quarterly', 'none') OR schedule IS NULL),
  schedule_time TIME,
  schedule_day INTEGER,
  recipients TEXT[],
  last_generated_at TIMESTAMPTZ,
  next_scheduled_at TIMESTAMPTZ,

  -- Sharing
  is_public BOOLEAN DEFAULT false,
  share_token TEXT UNIQUE,
  share_expires_at TIMESTAMPTZ,

  -- Ownership
  created_by UUID REFERENCES public.profiles(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create analytics_snapshots table (daily rollups)
CREATE TABLE IF NOT EXISTS public.analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL,

  -- Lead Metrics
  total_leads INTEGER DEFAULT 0,
  new_leads INTEGER DEFAULT 0,
  contacted_leads INTEGER DEFAULT 0,
  qualified_leads INTEGER DEFAULT 0,
  converted_leads INTEGER DEFAULT 0,
  lost_leads INTEGER DEFAULT 0,

  -- Activity Metrics
  emails_sent INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  emails_clicked INTEGER DEFAULT 0,
  calls_made INTEGER DEFAULT 0,
  calls_answered INTEGER DEFAULT 0,
  meetings_booked INTEGER DEFAULT 0,
  meetings_completed INTEGER DEFAULT 0,

  -- Revenue Metrics
  revenue_pipeline DECIMAL(15, 2) DEFAULT 0,
  revenue_closed DECIMAL(15, 2) DEFAULT 0,
  avg_deal_size DECIMAL(15, 2) DEFAULT 0,

  -- Conversion Metrics
  conversion_rate DECIMAL(5, 2) DEFAULT 0,
  avg_time_to_convert INTEGER,
  avg_touchpoints_to_convert INTEGER,

  -- Source Breakdown (JSONB for flexibility)
  leads_by_source JSONB DEFAULT '{}',
  leads_by_status JSONB DEFAULT '{}',
  leads_by_temperature JSONB DEFAULT '{}',

  -- Team Performance (JSONB)
  team_metrics JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(snapshot_date)
);

-- Create landing_pages table
CREATE TABLE IF NOT EXISTS public.landing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id),
  campaign_id UUID REFERENCES public.campaigns(id),

  -- Page Info
  page_name TEXT,
  slug TEXT UNIQUE NOT NULL,
  template_used TEXT,
  url TEXT,

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),

  -- Metrics
  visit_count INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5, 2) DEFAULT 0,
  avg_time_on_page INTEGER,
  bounce_rate DECIMAL(5, 2) DEFAULT 0,

  -- Content (for dynamic pages)
  content JSONB DEFAULT '{}',

  -- Timestamps
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_reports_type ON public.reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_created_by ON public.reports(created_by);
CREATE INDEX IF NOT EXISTS idx_reports_schedule ON public.reports(schedule) WHERE schedule IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reports_share_token ON public.reports(share_token) WHERE share_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_analytics_date ON public.analytics_snapshots(snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_landing_pages_slug ON public.landing_pages(slug);
CREATE INDEX IF NOT EXISTS idx_landing_pages_campaign ON public.landing_pages(campaign_id);
CREATE INDEX IF NOT EXISTS idx_landing_pages_status ON public.landing_pages(status);

-- Enable Row Level Security
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own reports" ON public.reports;
DROP POLICY IF EXISTS "Users can create reports" ON public.reports;
DROP POLICY IF EXISTS "Users can update own reports" ON public.reports;
DROP POLICY IF EXISTS "Users can delete own reports" ON public.reports;
DROP POLICY IF EXISTS "Admins can view all reports" ON public.reports;
DROP POLICY IF EXISTS "Authenticated users can view analytics" ON public.analytics_snapshots;
DROP POLICY IF EXISTS "System can manage analytics" ON public.analytics_snapshots;
DROP POLICY IF EXISTS "Authenticated users can view landing pages" ON public.landing_pages;
DROP POLICY IF EXISTS "Authenticated users can manage landing pages" ON public.landing_pages;

-- RLS Policies for reports
CREATE POLICY "Users can view own reports" ON public.reports
  FOR SELECT
  USING (created_by = auth.uid() OR is_public = true);

CREATE POLICY "Users can create reports" ON public.reports
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own reports" ON public.reports
  FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete own reports" ON public.reports
  FOR DELETE
  USING (created_by = auth.uid());

CREATE POLICY "Admins can view all reports" ON public.reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for analytics_snapshots
CREATE POLICY "Authenticated users can view analytics" ON public.analytics_snapshots
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "System can manage analytics" ON public.analytics_snapshots
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for landing_pages
CREATE POLICY "Authenticated users can view landing pages" ON public.landing_pages
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage landing pages" ON public.landing_pages
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS reports_updated_at ON public.reports;
CREATE TRIGGER reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS landing_pages_updated_at ON public.landing_pages;
CREATE TRIGGER landing_pages_updated_at
  BEFORE UPDATE ON public.landing_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate share token
CREATE OR REPLACE FUNCTION public.generate_share_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Migration: 0009_audit_logs
-- Description: Audit Logs Table
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    metadata JSONB DEFAULT '{}',
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- RLS Policies
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all audit logs" ON audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;

-- Only admins can view audit logs
CREATE POLICY "Admins can view all audit logs"
    ON audit_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- System can insert audit logs (via service role)
CREATE POLICY "System can insert audit logs"
    ON audit_logs FOR INSERT
    WITH CHECK (true);

-- Function to create audit log entry
CREATE OR REPLACE FUNCTION create_audit_log(
    p_user_id UUID,
    p_action VARCHAR,
    p_resource_type VARCHAR,
    p_resource_id UUID DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::JSONB,
    p_ip_address VARCHAR DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO audit_logs (
        user_id, action, resource_type, resource_id,
        old_values, new_values, metadata, ip_address, user_agent
    )
    VALUES (
        p_user_id, p_action, p_resource_type, p_resource_id,
        p_old_values, p_new_values, p_metadata, p_ip_address, p_user_agent
    )
    RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for automatic audit logging
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM create_audit_log(
            auth.uid(),
            'create',
            TG_TABLE_NAME,
            NEW.id,
            NULL,
            to_jsonb(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM create_audit_log(
            auth.uid(),
            'update',
            TG_TABLE_NAME,
            NEW.id,
            to_jsonb(OLD),
            to_jsonb(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM create_audit_log(
            auth.uid(),
            'delete',
            TG_TABLE_NAME,
            OLD.id,
            to_jsonb(OLD),
            NULL
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Migration: 0010_webhooks
-- Description: Webhook Configurations Table
-- ============================================================

CREATE TABLE IF NOT EXISTS webhook_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('inbound', 'outbound')),
    url TEXT,
    secret VARCHAR(255),
    events TEXT[] DEFAULT '{}',
    headers JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    retry_count INTEGER DEFAULT 3,
    retry_delay INTEGER DEFAULT 1000,
    ip_allowlist TEXT[],
    last_triggered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhook Delivery Logs
CREATE TABLE IF NOT EXISTS webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id UUID REFERENCES webhook_configs(id) ON DELETE CASCADE NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    response_status INTEGER,
    response_body TEXT,
    attempt_number INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'retrying')),
    error_message TEXT,
    duration_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_webhook_configs_user_id ON webhook_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_configs_type ON webhook_configs(type);
CREATE INDEX IF NOT EXISTS idx_webhook_configs_active ON webhook_configs(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook_id ON webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_created_at ON webhook_deliveries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_status ON webhook_deliveries(status);

-- RLS Policies
ALTER TABLE webhook_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own webhook configs" ON webhook_configs;
DROP POLICY IF EXISTS "Users can create webhook configs" ON webhook_configs;
DROP POLICY IF EXISTS "Users can update own webhook configs" ON webhook_configs;
DROP POLICY IF EXISTS "Users can delete own webhook configs" ON webhook_configs;
DROP POLICY IF EXISTS "Users can view own webhook deliveries" ON webhook_deliveries;
DROP POLICY IF EXISTS "System can insert webhook deliveries" ON webhook_deliveries;

-- Users can manage their own webhook configs
CREATE POLICY "Users can view own webhook configs"
    ON webhook_configs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create webhook configs"
    ON webhook_configs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own webhook configs"
    ON webhook_configs FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own webhook configs"
    ON webhook_configs FOR DELETE
    USING (auth.uid() = user_id);

-- Users can view deliveries for their webhooks
CREATE POLICY "Users can view own webhook deliveries"
    ON webhook_deliveries FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM webhook_configs
            WHERE webhook_configs.id = webhook_deliveries.webhook_id
            AND webhook_configs.user_id = auth.uid()
        )
    );

-- System can insert deliveries (via service role)
CREATE POLICY "System can insert webhook deliveries"
    ON webhook_deliveries FOR INSERT
    WITH CHECK (true);

-- Update timestamp trigger
DROP TRIGGER IF EXISTS update_webhook_configs_updated_at ON webhook_configs;
CREATE TRIGGER update_webhook_configs_updated_at
    BEFORE UPDATE ON webhook_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Migration: 0011_api_keys
-- Description: API Keys Table and System Settings
-- ============================================================

CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    key_prefix VARCHAR(10) NOT NULL,
    scopes TEXT[] DEFAULT '{}',
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_prefix ON api_keys(key_prefix);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active) WHERE is_active = true;

-- RLS Policies
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own API keys" ON api_keys;
DROP POLICY IF EXISTS "Users can create API keys" ON api_keys;
DROP POLICY IF EXISTS "Users can update own API keys" ON api_keys;
DROP POLICY IF EXISTS "Users can delete own API keys" ON api_keys;

CREATE POLICY "Users can view own API keys"
    ON api_keys FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create API keys"
    ON api_keys FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys"
    ON api_keys FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys"
    ON api_keys FOR DELETE
    USING (auth.uid() = user_id);

-- System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT 'general',
    is_public BOOLEAN DEFAULT false,
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default system settings
INSERT INTO system_settings (key, value, description, category, is_public) VALUES
    ('company_name', '"LeadFlow Platform"', 'Company name displayed in the app', 'branding', true),
    ('timezone', '"UTC"', 'Default timezone for the system', 'general', true),
    ('date_format', '"MMM d, yyyy"', 'Default date format', 'general', true),
    ('currency', '"USD"', 'Default currency', 'general', true),
    ('lead_scoring_enabled', 'true', 'Enable automatic lead scoring', 'features', false),
    ('automation_enabled', 'true', 'Enable workflow automation', 'features', false),
    ('max_api_keys_per_user', '5', 'Maximum API keys per user', 'limits', false),
    ('max_webhooks_per_user', '10', 'Maximum webhooks per user', 'limits', false),
    ('session_timeout_minutes', '480', 'Session timeout in minutes', 'security', false)
ON CONFLICT (key) DO NOTHING;

-- RLS for system settings
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view public settings" ON system_settings;
DROP POLICY IF EXISTS "Admins can view all settings" ON system_settings;
DROP POLICY IF EXISTS "Admins can update settings" ON system_settings;

-- Public settings visible to all authenticated users
CREATE POLICY "Authenticated users can view public settings"
    ON system_settings FOR SELECT
    USING (is_public = true AND auth.uid() IS NOT NULL);

-- Admins can view all settings
CREATE POLICY "Admins can view all settings"
    ON system_settings FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Admins can update settings
CREATE POLICY "Admins can update settings"
    ON system_settings FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Update timestamp trigger
DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;
CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Done! All migrations applied successfully.
-- ============================================================
