-- Fix RLS policies on profiles to NOT reference auth.users table
-- Regular users don't have SELECT permission on auth.users, causing
-- "permission denied for table users" errors.
-- Use ONLY auth.jwt() which is available to all authenticated users.

-- Drop the broken policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Recreate using ONLY auth.jwt() - no auth.users reference
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Also ensure the "Users can view own profile" policy exists
-- This is the most important policy - every user should see their own row
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);
