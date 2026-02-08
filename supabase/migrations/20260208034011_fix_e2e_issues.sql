-- Fix 1: Relax activities outcome check constraint
-- The old constraint only allows 'positive', 'negative', 'neutral', 'pending'
-- but activities should allow free-text outcomes
ALTER TABLE public.activities DROP CONSTRAINT IF EXISTS activities_outcome_check;

-- Fix 2: Fix RLS infinite recursion on profiles
-- The admin policies query profiles inside a policy ON profiles, causing recursion.
-- Replace with auth.jwt()-based checks that don't self-reference.
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
      AND u.raw_user_meta_data ->> 'role' = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
      AND u.raw_user_meta_data ->> 'role' = 'admin'
    )
  );

-- Fix 3: automation_rules priority column needs to allow 0
-- (This was actually a test data issue - priority 0 update should work)
-- No schema change needed, investigate via test.
