-- Fix RLS SELECT policies on businesses and campaigns tables
-- Previously: any authenticated user could read ALL records (data isolation breach)
-- Now: regular users see only records assigned to them; admins/managers see all
-- Closes #1

-- ============================================================
-- BUSINESSES: Replace permissive SELECT policy
-- Businesses use assigned_to for ownership (no created_by column)
-- ============================================================

DROP POLICY IF EXISTS "Authenticated users can view businesses" ON public.businesses;

CREATE POLICY "Users can view assigned businesses" ON public.businesses
  FOR SELECT
  USING (
    assigned_to = auth.uid()
    OR assigned_to IS NULL
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- ============================================================
-- CAMPAIGNS: Replace permissive SELECT policy
-- Campaigns use created_by for ownership
-- ============================================================

DROP POLICY IF EXISTS "Authenticated users can view campaigns" ON public.campaigns;

CREATE POLICY "Users can view own campaigns" ON public.campaigns
  FOR SELECT
  USING (
    created_by = auth.uid()
    OR created_by IS NULL
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- ============================================================
-- CAMPAIGN_MEMBERS: Scope to campaigns the user can see
-- ============================================================

DROP POLICY IF EXISTS "Authenticated users can view campaign members" ON public.campaign_members;

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
          WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
      )
    )
  );

-- Also tighten the ALL policy on campaign_members
DROP POLICY IF EXISTS "Authenticated users can manage campaign members" ON public.campaign_members;

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
          WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
      )
    )
  );
