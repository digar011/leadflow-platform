import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://kitimzmjjuvznfiyjiuw.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpdGltem1qanV2em5maXlqaXV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMDIxNDksImV4cCI6MjA4NDg3ODE0OX0.IJ3XCq7QHEHvPqm2HYXsW6N0RxF0Rbl7uSPZdpaMkJk";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpdGltem1qanV2em5maXlqaXV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTMwMjE0OSwiZXhwIjoyMDg0ODc4MTQ5fQ.c__RfaNQlw335ASnt_N437-dlVclrFFRa_vfppEE7qM";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
const anonClient = createClient(SUPABASE_URL, ANON_KEY);

async function setup() {
  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers({ perPage: 100 });
  const existing = existingUsers?.users?.find(u => u.email === "admin123@test.com");

  let userId;

  if (existing) {
    userId = existing.id;
    console.log("User already exists:", userId);
    // Update to admin role with correct password
    const { error: updateErr } = await supabase.auth.admin.updateUserById(userId, {
      password: "Test123!",
      user_metadata: { role: "admin", full_name: "Test Admin" },
      email_confirm: true,
    });
    if (updateErr) {
      console.error("Update error:", updateErr);
      return;
    }
    console.log("Updated user metadata and password");

    // Upsert profile
    const { error: profErr } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        email: "admin123@test.com",
        full_name: "Test Admin",
        role: "admin",
        is_active: true,
      });
    if (profErr) console.error("Profile upsert error:", profErr);
    else console.log("Profile upserted to admin");
  } else {
    // Create new user
    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email: "admin123@test.com",
      password: "Test123!",
      email_confirm: true,
      user_metadata: { role: "admin", full_name: "Test Admin" },
    });

    if (createErr) {
      console.error("Create error:", createErr);
      return;
    }

    userId = newUser.user.id;
    console.log("Created user:", userId);

    // Wait for trigger to create profile
    await new Promise((r) => setTimeout(r, 2000));

    // Check if profile was created by trigger
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profile) {
      // Update role to admin
      const { error: updateErr } = await supabase
        .from("profiles")
        .update({ role: "admin", full_name: "Test Admin", is_active: true })
        .eq("id", userId);
      if (updateErr) console.error("Profile update error:", updateErr);
      else console.log("Profile role updated to admin");
    } else {
      // Insert profile manually
      const { error: insertErr } = await supabase.from("profiles").insert({
        id: userId,
        email: "admin123@test.com",
        full_name: "Test Admin",
        role: "admin",
        is_active: true,
      });
      if (insertErr) console.error("Insert profile error:", insertErr);
      else console.log("Profile created manually as admin");
    }
  }

  // Verify login
  const { data: session, error: loginErr } = await anonClient.auth.signInWithPassword({
    email: "admin123@test.com",
    password: "Test123!",
  });

  if (loginErr) {
    console.error("Login test FAILED:", loginErr.message);
  } else {
    console.log("\nLogin test PASSED");
    console.log("  Email:", session.user.email);
    console.log("  Role:", session.user.user_metadata?.role);
    console.log("  User ID:", session.user.id);
  }

  // Verify profile
  const { data: finalProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  console.log("\nProfile verification:");
  console.log("  Full Name:", finalProfile?.full_name);
  console.log("  Email:", finalProfile?.email);
  console.log("  Role:", finalProfile?.role);
  console.log("  Active:", finalProfile?.is_active);
}

setup().catch(console.error);
