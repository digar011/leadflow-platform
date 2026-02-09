-- Email Capture: BCC/Forward email auto-logging
-- Add forwarding address to profiles for email capture
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email_forwarding_address TEXT UNIQUE;

-- Captured emails table (audit log + unmatched email storage)
CREATE TABLE IF NOT EXISTS public.captured_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  from_address TEXT NOT NULL,
  to_addresses TEXT[] NOT NULL DEFAULT '{}',
  cc_addresses TEXT[] DEFAULT '{}',
  subject TEXT,
  body_snippet TEXT,
  message_id TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  matched BOOLEAN NOT NULL DEFAULT FALSE,
  activity_id UUID REFERENCES public.activities(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_captured_emails_user ON captured_emails(user_id);
CREATE INDEX IF NOT EXISTS idx_captured_emails_business ON captured_emails(business_id) WHERE business_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_captured_emails_message_id ON captured_emails(user_id, message_id) WHERE message_id IS NOT NULL;

-- RLS
ALTER TABLE public.captured_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own captured emails"
  ON public.captured_emails FOR SELECT
  USING (auth.uid() = user_id);
