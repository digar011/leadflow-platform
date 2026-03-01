-- Fix RLS policies to include org_admin and super_admin roles
-- The role_hierarchy migration (20260210204145) migrated admin → org_admin
-- but the RLS fix migration (20260211000000) still checks for ('admin', 'manager')

-- BUSINESSES: Fix SELECT policy
DROP POLICY IF EXISTS "Users can view assigned businesses" ON public.businesses;
CREATE POLICY "Users can view assigned businesses" ON public.businesses
  FOR SELECT
  USING (
    assigned_to = auth.uid()
    OR assigned_to IS NULL
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'org_admin', 'admin')
    )
  );

-- CAMPAIGNS: Fix SELECT policy
DROP POLICY IF EXISTS "Users can view own campaigns" ON public.campaigns;
CREATE POLICY "Users can view own campaigns" ON public.campaigns
  FOR SELECT
  USING (
    created_by = auth.uid()
    OR created_by IS NULL
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'org_admin', 'admin')
    )
  );

-- CAMPAIGN_MEMBERS: Fix SELECT policy
DROP POLICY IF EXISTS "Users can view campaign members for visible campaigns" ON public.campaign_members;
CREATE POLICY "Users can view campaign members for visible campaigns" ON public.campaign_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = campaign_members.campaign_id
      AND (
        c.created_by = auth.uid()
        OR c.created_by IS NULL
        OR EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role IN ('super_admin', 'org_admin', 'admin')
        )
      )
    )
  );

-- CAMPAIGN_MEMBERS: Fix ALL policy
DROP POLICY IF EXISTS "Users can manage campaign members for own campaigns" ON public.campaign_members;
CREATE POLICY "Users can manage campaign members for own campaigns" ON public.campaign_members
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = campaign_members.campaign_id
      AND (
        c.created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role IN ('super_admin', 'org_admin', 'admin')
        )
      )
    )
  );
