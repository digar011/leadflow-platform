-- Fix priority constraint to allow 0 (highest priority)
ALTER TABLE public.automation_rules DROP CONSTRAINT IF EXISTS automation_rules_priority_check;
ALTER TABLE public.automation_rules ADD CONSTRAINT automation_rules_priority_check CHECK (priority >= 0 AND priority <= 100);
