-- Add validation constraints for data integrity
-- Closes #5, #6, #7

-- ============================================================
-- Issue #5: Enforce single primary contact per business
-- The trigger ensure_single_primary_contact() already unsets other
-- primaries, but a unique partial index provides belt-and-suspenders
-- protection at the DB level against race conditions.
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_single_primary
  ON public.contacts (business_id)
  WHERE is_primary = true;

-- ============================================================
-- Issue #6: Email format validation on contacts table
-- Allows NULL emails but validates format when provided.
-- ============================================================

ALTER TABLE public.contacts
  ADD CONSTRAINT contacts_email_format
  CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$');

-- ============================================================
-- Issue #7: Prevent negative deal_value on businesses table
-- Allows NULL deal_value but requires non-negative when set.
-- ============================================================

ALTER TABLE public.businesses
  ADD CONSTRAINT businesses_deal_value_non_negative
  CHECK (deal_value IS NULL OR deal_value >= 0);
