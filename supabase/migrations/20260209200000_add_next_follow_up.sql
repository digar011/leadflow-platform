-- Add next_follow_up column to businesses table
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS next_follow_up DATE;

-- Index for fast lookups on follow-up dates (only non-null values)
CREATE INDEX IF NOT EXISTS idx_businesses_next_follow_up
  ON public.businesses(next_follow_up) WHERE next_follow_up IS NOT NULL;
