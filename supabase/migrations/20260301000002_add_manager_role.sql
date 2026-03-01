-- Add 'manager' to the role constraint
-- TypeScript UserRole type and permissions.ts define manager role permissions
-- but the DB constraint from role_hierarchy migration only allows
-- ('super_admin', 'org_admin', 'admin', 'user')

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('super_admin', 'org_admin', 'admin', 'manager', 'user'));
