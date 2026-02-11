-- Migration: Expand role hierarchy
-- super_admin = Goldyon/Codexium team (god mode)
-- org_admin = Business/Enterprise customer admin (their workspace only)
-- user = Standard user

-- Update the role constraint to include super_admin and org_admin
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('super_admin', 'org_admin', 'admin', 'user'));

-- Migrate existing 'admin' roles to 'org_admin' (except super admins)
-- We'll set super_admin separately for known emails
UPDATE public.profiles 
SET role = 'org_admin' 
WHERE role = 'admin';

-- Set super_admin for Goldyon team
UPDATE public.profiles 
SET role = 'super_admin' 
WHERE email IN ('diego.j.garnica@gmail.com');

-- Add organization_id column for future multi-tenancy
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS organization_id UUID;

-- Super admin RLS: can see ALL profiles
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
CREATE POLICY "Super admins can view all profiles" ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Super admin RLS: can update ALL profiles  
DROP POLICY IF EXISTS "Super admins can update all profiles" ON public.profiles;
CREATE POLICY "Super admins can update all profiles" ON public.profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Update the existing admin policies to work with org_admin
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Org admins can view org profiles" ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.role = 'org_admin'
      AND (
        p.organization_id IS NULL 
        OR p.organization_id = profiles.organization_id
      )
    )
  );

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Org admins can update org profiles" ON public.profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.role = 'org_admin'
      AND (
        p.organization_id IS NULL 
        OR p.organization_id = profiles.organization_id
      )
    )
  );