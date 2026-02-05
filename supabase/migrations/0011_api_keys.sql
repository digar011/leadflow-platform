-- API Keys Table
-- Allows users to create API keys for programmatic access

CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL, -- SHA-256 hash of the actual key
    key_prefix VARCHAR(10) NOT NULL, -- First 8 chars for identification
    scopes TEXT[] DEFAULT '{}', -- Permissions: read, write, admin
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_prefix ON api_keys(key_prefix);
CREATE INDEX idx_api_keys_active ON api_keys(is_active) WHERE is_active = true;

-- RLS Policies
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own API keys"
    ON api_keys FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create API keys"
    ON api_keys FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys"
    ON api_keys FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys"
    ON api_keys FOR DELETE
    USING (auth.uid() = user_id);

-- System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT 'general',
    is_public BOOLEAN DEFAULT false,
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default system settings
INSERT INTO system_settings (key, value, description, category, is_public) VALUES
    ('company_name', '"LeadFlow Platform"', 'Company name displayed in the app', 'branding', true),
    ('timezone', '"UTC"', 'Default timezone for the system', 'general', true),
    ('date_format', '"MMM d, yyyy"', 'Default date format', 'general', true),
    ('currency', '"USD"', 'Default currency', 'general', true),
    ('lead_scoring_enabled', 'true', 'Enable automatic lead scoring', 'features', false),
    ('automation_enabled', 'true', 'Enable workflow automation', 'features', false),
    ('max_api_keys_per_user', '5', 'Maximum API keys per user', 'limits', false),
    ('max_webhooks_per_user', '10', 'Maximum webhooks per user', 'limits', false),
    ('session_timeout_minutes', '480', 'Session timeout in minutes', 'security', false)
ON CONFLICT (key) DO NOTHING;

-- RLS for system settings
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Public settings visible to all authenticated users
CREATE POLICY "Authenticated users can view public settings"
    ON system_settings FOR SELECT
    USING (is_public = true AND auth.uid() IS NOT NULL);

-- Admins can view all settings
CREATE POLICY "Admins can view all settings"
    ON system_settings FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Admins can update settings
CREATE POLICY "Admins can update settings"
    ON system_settings FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Update timestamp trigger
CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
