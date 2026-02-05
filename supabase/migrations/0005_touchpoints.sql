-- Migration: 0005_touchpoints
-- Description: Customer journey touchpoints for 360-degree view
-- Created: 2024

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
