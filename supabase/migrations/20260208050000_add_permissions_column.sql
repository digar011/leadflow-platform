-- Add granular permissions column to profiles table
-- Empty {} means "use role defaults", overrides take precedence
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}';

-- GIN index for efficient JSONB queries
CREATE INDEX IF NOT EXISTS idx_profiles_permissions ON profiles USING GIN (permissions);
