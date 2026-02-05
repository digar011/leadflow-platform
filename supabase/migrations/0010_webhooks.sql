-- Webhook Configurations Table
-- Stores both inbound and outbound webhook configurations

CREATE TABLE IF NOT EXISTS webhook_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('inbound', 'outbound')),
    url TEXT, -- For outbound webhooks
    secret VARCHAR(255), -- HMAC secret for signature verification
    events TEXT[] DEFAULT '{}', -- Events to listen for/trigger on
    headers JSONB DEFAULT '{}', -- Custom headers for outbound
    is_active BOOLEAN DEFAULT true,
    retry_count INTEGER DEFAULT 3,
    retry_delay INTEGER DEFAULT 1000, -- milliseconds
    ip_allowlist TEXT[], -- For inbound webhooks
    last_triggered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhook Delivery Logs
CREATE TABLE IF NOT EXISTS webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id UUID REFERENCES webhook_configs(id) ON DELETE CASCADE NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    response_status INTEGER,
    response_body TEXT,
    attempt_number INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'retrying')),
    error_message TEXT,
    duration_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_webhook_configs_user_id ON webhook_configs(user_id);
CREATE INDEX idx_webhook_configs_type ON webhook_configs(type);
CREATE INDEX idx_webhook_configs_active ON webhook_configs(is_active) WHERE is_active = true;
CREATE INDEX idx_webhook_deliveries_webhook_id ON webhook_deliveries(webhook_id);
CREATE INDEX idx_webhook_deliveries_created_at ON webhook_deliveries(created_at DESC);
CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(status);

-- RLS Policies
ALTER TABLE webhook_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- Users can manage their own webhook configs
CREATE POLICY "Users can view own webhook configs"
    ON webhook_configs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create webhook configs"
    ON webhook_configs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own webhook configs"
    ON webhook_configs FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own webhook configs"
    ON webhook_configs FOR DELETE
    USING (auth.uid() = user_id);

-- Users can view deliveries for their webhooks
CREATE POLICY "Users can view own webhook deliveries"
    ON webhook_deliveries FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM webhook_configs
            WHERE webhook_configs.id = webhook_deliveries.webhook_id
            AND webhook_configs.user_id = auth.uid()
        )
    );

-- System can insert deliveries (via service role)
CREATE POLICY "System can insert webhook deliveries"
    ON webhook_deliveries FOR INSERT
    WITH CHECK (true);

-- Update timestamp trigger
CREATE TRIGGER update_webhook_configs_updated_at
    BEFORE UPDATE ON webhook_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
