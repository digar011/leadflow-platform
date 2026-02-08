-- Migration: Security Fixes
-- Addresses: VULN-01, VULN-02, VULN-05
-- Date: 2026-02-09

-- =============================================================================
-- VULN-01 FIX: Prevent self-assigned admin role via signup metadata
-- The handle_new_user() trigger was reading role from client-supplied metadata.
-- Now it always defaults to 'user'.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user'  -- Always default to 'user'. Admin must be set server-side.
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- VULN-02 FIX: Prevent users from modifying their own role/subscription tier
-- Add a BEFORE UPDATE trigger that blocks changes to protected columns
-- unless the request comes from service_role (server-side admin operations).
-- =============================================================================

CREATE OR REPLACE FUNCTION public.protect_profile_columns()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow service_role to modify anything (admin operations)
  IF current_setting('request.jwt.claim.role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- For regular users: prevent changes to protected columns
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    NEW.role := OLD.role;
  END IF;

  IF OLD.subscription_tier IS DISTINCT FROM NEW.subscription_tier THEN
    NEW.subscription_tier := OLD.subscription_tier;
  END IF;

  IF OLD.subscription_billing_cycle IS DISTINCT FROM NEW.subscription_billing_cycle THEN
    NEW.subscription_billing_cycle := OLD.subscription_billing_cycle;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS protect_profile_columns_trigger ON public.profiles;
CREATE TRIGGER protect_profile_columns_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_columns();

-- =============================================================================
-- VULN-05 FIX: Admin RLS policies should check profiles.role column,
-- not JWT user_metadata (which is client-controlled).
-- We use a helper function to safely check admin status without recursive RLS.
-- =============================================================================

-- Helper function to check admin status without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Recreate admin RLS policies using the helper function
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE
  USING (public.is_admin());

-- Ensure base user policies still exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);
