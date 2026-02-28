import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read .env.local
const envPath = resolve(__dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIndex = trimmed.indexOf('=');
  if (eqIndex > 0) {
    env[trimmed.slice(0, eqIndex).trim()] = trimmed.slice(eqIndex + 1).trim();
  }
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const users = [
  {
    email: 'test@example.com',
    password: 'TestPassword123!',
    role: 'user',
    full_name: 'Test User',
    tier: 'starter',
  },
  {
    email: 'admin@example.com',
    password: 'AdminPassword123!',
    role: 'org_admin',
    full_name: 'Admin User',
    tier: 'enterprise',
  },
];

async function createUser({ email, password, role, full_name, tier }) {
  console.log(`\nCreating user: ${email} (role: ${role}, tier: ${tier})...`);

  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find(u => u.email === email);

  if (existing) {
    console.log(`  User ${email} already exists (id: ${existing.id}). Updating profile...`);

    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        role,
        full_name,
        subscription_tier: tier,
        subscription_billing_cycle: 'monthly',
      })
      .eq('id', existing.id);

    if (updateError) {
      console.error(`  Failed to update profile: ${updateError.message}`);
    } else {
      console.log(`  Profile updated successfully.`);
    }
    return;
  }

  // Create auth user
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  });

  if (error) {
    console.error(`  Failed to create user: ${error.message}`);
    return;
  }

  console.log(`  Auth user created (id: ${data.user.id})`);

  // Wait for trigger to create profile
  await new Promise(r => setTimeout(r, 1000));

  // Update profile with role and tier (service_role bypasses the protect_profile_columns trigger)
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      role,
      full_name,
      subscription_tier: tier,
      subscription_billing_cycle: 'monthly',
    })
    .eq('id', data.user.id);

  if (profileError) {
    console.error(`  Failed to update profile: ${profileError.message}`);
  } else {
    console.log(`  Profile set: role=${role}, tier=${tier}`);
  }
}

async function main() {
  console.log('=== Goldyon CRM - Test User Setup ===');
  console.log(`Supabase: ${supabaseUrl}`);

  for (const user of users) {
    await createUser(user);
  }

  console.log('\n=== Done ===');
  console.log('\nTest Credentials:');
  console.log('┌─────────────────┬──────────────────────┬──────────────────────┐');
  console.log('│ Role            │ Email                │ Password             │');
  console.log('├─────────────────┼──────────────────────┼──────────────────────┤');
  console.log('│ Regular User    │ test@example.com     │ TestPassword123!     │');
  console.log('│ Admin User      │ admin@example.com    │ AdminPassword123!    │');
  console.log('└─────────────────┴──────────────────────┴──────────────────────┘');
}

main().catch(console.error);
