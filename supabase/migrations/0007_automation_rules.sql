-- Migration: 0007_automation_rules
-- Description: Workflow automation rules table
-- Created: 2024

-- Create automation_rules table
CREATE TABLE IF NOT EXISTS public.automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  name TEXT NOT NULL,
  description TEXT,

  -- Trigger Configuration
  trigger_type TEXT NOT NULL CHECK (trigger_type IN (
    'lead_created', 'lead_updated', 'status_changed',
    'score_threshold', 'inactivity', 'date_based', 'form_submission',
    'email_opened', 'email_clicked', 'meeting_scheduled'
  )),
  trigger_config JSONB DEFAULT '{}',

  -- Action Configuration
  action_type TEXT NOT NULL CHECK (action_type IN (
    'send_email', 'create_task', 'assign_user', 'update_status',
    'update_score', 'add_to_campaign', 'send_webhook', 'add_tag',
    'send_notification', 'create_activity'
  )),
  action_config JSONB DEFAULT '{}',

  -- Conditions
  conditions JSONB DEFAULT '[]', -- Array of condition objects

  -- Status
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 50 CHECK (priority >= 1 AND priority <= 100),

  -- Execution Stats
  last_triggered_at TIMESTAMPTZ,
  trigger_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,

  -- Ownership
  created_by UUID REFERENCES public.profiles(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create automation_logs table for tracking executions
CREATE TABLE IF NOT EXISTS public.automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID NOT NULL REFERENCES public.automation_rules(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,

  -- Execution Details
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'success', 'failed', 'skipped')),
  trigger_data JSONB DEFAULT '{}',
  action_result JSONB DEFAULT '{}',
  error_message TEXT,

  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create scheduled_tasks table for delayed/scheduled automation actions
CREATE TABLE IF NOT EXISTS public.scheduled_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES public.automation_rules(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,

  -- Task Details
  task_type TEXT NOT NULL,
  task_config JSONB DEFAULT '{}',

  -- Scheduling
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),

  -- Execution
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_attempt_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_automation_rules_active ON public.automation_rules(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_automation_rules_trigger ON public.automation_rules(trigger_type);
CREATE INDEX IF NOT EXISTS idx_automation_rules_priority ON public.automation_rules(priority DESC);
CREATE INDEX IF NOT EXISTS idx_automation_logs_rule ON public.automation_logs(rule_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_business ON public.automation_logs(business_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_status ON public.automation_logs(status);
CREATE INDEX IF NOT EXISTS idx_automation_logs_created ON public.automation_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_scheduled ON public.scheduled_tasks(scheduled_for) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_status ON public.scheduled_tasks(status);

-- Enable Row Level Security
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for automation_rules
CREATE POLICY "Authenticated users can view automation rules" ON public.automation_rules
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage automation rules" ON public.automation_rules
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for automation_logs
CREATE POLICY "Authenticated users can view automation logs" ON public.automation_logs
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert automation logs" ON public.automation_logs
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for scheduled_tasks
CREATE POLICY "Authenticated users can view scheduled tasks" ON public.scheduled_tasks
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "System can manage scheduled tasks" ON public.scheduled_tasks
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS automation_rules_updated_at ON public.automation_rules;
CREATE TRIGGER automation_rules_updated_at
  BEFORE UPDATE ON public.automation_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
