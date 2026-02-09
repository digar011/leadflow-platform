-- Add support for storing external integration keys (Supabase, Resend, etc.)
-- and tracking which integration type each key belongs to.

ALTER TABLE api_keys
  ADD COLUMN IF NOT EXISTS integration_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS external_key TEXT;

-- Index for filtering by integration type
CREATE INDEX IF NOT EXISTS idx_api_keys_integration_type
  ON api_keys(integration_type) WHERE integration_type IS NOT NULL;

-- Comment for documentation
COMMENT ON COLUMN api_keys.integration_type IS 'Type of integration: supabase, email, phone, webhook, crm, custom';
COMMENT ON COLUMN api_keys.external_key IS 'External service API key/secret provided by the user';
