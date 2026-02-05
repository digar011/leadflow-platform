-- Migration: 0004_activities
-- Description: Activities table for all interactions
-- Created: 2024

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

-- RLS Policies for activities
-- All authenticated users can view activities
CREATE POLICY "Authenticated users can view activities" ON public.activities
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Users can insert activities
CREATE POLICY "Authenticated users can insert activities" ON public.activities
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Users can update their own activities
CREATE POLICY "Users can update own activities" ON public.activities
  FOR UPDATE
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can delete activities
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
