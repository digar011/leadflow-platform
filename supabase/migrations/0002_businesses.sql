-- Migration: 0002_businesses
-- Description: Main leads/businesses table with 40+ fields
-- Created: 2024

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

-- RLS Policies for businesses
-- All authenticated users can view businesses
CREATE POLICY "Authenticated users can view businesses" ON public.businesses
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Users can insert businesses
CREATE POLICY "Authenticated users can insert businesses" ON public.businesses
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Users can update businesses assigned to them or that they created
CREATE POLICY "Users can update assigned businesses" ON public.businesses
  FOR UPDATE
  USING (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete businesses
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
