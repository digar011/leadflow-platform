-- Migration: 0003_contacts
-- Description: Contacts table for people at businesses
-- Created: 2024

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

-- RLS Policies for contacts
-- All authenticated users can view contacts
CREATE POLICY "Authenticated users can view contacts" ON public.contacts
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Users can insert contacts
CREATE POLICY "Authenticated users can insert contacts" ON public.contacts
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Users can update contacts for businesses they have access to
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

-- Admins can delete contacts
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
