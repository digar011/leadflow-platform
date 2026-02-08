-- ============================================================
-- LeadFlow Platform - Create Test User
-- ============================================================
--
-- STEP 1: Create the user in Supabase Dashboard
-- -------------------------------------------
-- Go to your Supabase Dashboard > Authentication > Users
-- Click "Add User" and enter:
--   Email: user@test.com
--   Password: Test123!
--   Check "Auto Confirm User"
--
-- STEP 2: Run this SQL to make the user an admin
-- -------------------------------------------
-- After creating the user, run this SQL in the SQL Editor
-- to upgrade them to admin role:

-- Update the test user to be an admin
UPDATE public.profiles
SET
  role = 'admin',
  full_name = 'Test Admin User',
  is_active = true
WHERE email = 'user@test.com';

-- Verify the user was created and updated
SELECT id, email, full_name, role, is_active, created_at
FROM public.profiles
WHERE email = 'user@test.com';

-- ============================================================
-- Alternative: Create user via Supabase Auth Admin API
-- ============================================================
-- If you prefer to create the user programmatically, you can use
-- the Supabase Admin API with the service role key:
--
-- curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/auth/v1/admin/users' \
--   -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
--   -H "Content-Type: application/json" \
--   -d '{
--     "email": "user@test.com",
--     "password": "Test123!",
--     "email_confirm": true,
--     "user_metadata": {
--       "full_name": "Test Admin User",
--       "role": "admin"
--     }
--   }'
