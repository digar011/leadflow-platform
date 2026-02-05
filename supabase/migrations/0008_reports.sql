-- Migration: 0008_reports
-- Description: Reports and analytics tables
-- Created: 2024

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
  schedule_day INTEGER, -- day of week (1-7) or day of month (1-31)
  recipients TEXT[], -- email addresses
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
  avg_time_to_convert INTEGER, -- in days
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
  avg_time_on_page INTEGER, -- in seconds
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
