#!/usr/bin/env node
/**
 * Cleanup stale E2E test data from previous runs
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://kitimzmjjuvznfiyjiuw.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpdGltem1qanV2em5maXlqaXV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTMwMjE0OSwiZXhwIjoyMDg0ODc4MTQ5fQ.c__RfaNQlw335ASnt_N437-dlVclrFFRa_vfppEE7qM";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function cleanup() {
  console.log("Cleaning up stale E2E test data...\n");

  // Order matters - delete children before parents (foreign key constraints)
  const cleanupSteps = [
    { table: "automation_logs", filter: { col: "rule_id", via: "automation_rules", matchCol: "name", match: "E2E Test%" } },
    { table: "api_keys", filter: { col: "name", pattern: "E2E Test%" } },
    { table: "webhook_configs", filter: { col: "name", pattern: "E2E Test%" } },
    { table: "automation_rules", filter: { col: "name", pattern: "E2E Test%" } },
    { table: "reports", filter: { col: "name", pattern: "E2E Test%" } },
    { table: "analytics_snapshots", filter: { col: "snapshot_type", pattern: "e2e_test%" } },
    { table: "campaign_contacts", filter: { col: "campaign_id", via: "campaigns", matchCol: "name", match: "E2E Test%" } },
    { table: "campaigns", filter: { col: "name", pattern: "E2E Test%" } },
    { table: "touchpoints", filter: { col: "contact_id", via: "contacts", matchCol: "first_name", match: "E2E Test%" } },
    { table: "activities", filter: { col: "subject", pattern: "E2E Test%" } },
    { table: "contacts", filter: { col: "first_name", pattern: "E2E Test%" } },
    { table: "businesses", filter: { col: "business_name", pattern: "E2E Test%" } },
    { table: "audit_logs", filter: { col: "action", pattern: "e2e_test%" } },
  ];

  for (const step of cleanupSteps) {
    try {
      if (step.filter.pattern) {
        const { data, error } = await supabase
          .from(step.table)
          .delete()
          .like(step.filter.col, step.filter.pattern)
          .select("id");

        if (error) {
          console.log(`  ! ${step.table}: ${error.message}`);
        } else {
          console.log(`  OK ${step.table}: deleted ${data?.length || 0} rows`);
        }
      } else if (step.filter.via) {
        // Need to look up IDs from parent table first
        const { data: parents } = await supabase
          .from(step.filter.via)
          .select("id")
          .like(step.filter.matchCol, step.filter.match);

        if (parents && parents.length > 0) {
          const parentIds = parents.map(p => p.id);
          const { data, error } = await supabase
            .from(step.table)
            .delete()
            .in(step.filter.col, parentIds)
            .select("id");

          if (error) {
            console.log(`  ! ${step.table}: ${error.message}`);
          } else {
            console.log(`  OK ${step.table}: deleted ${data?.length || 0} rows`);
          }
        } else {
          console.log(`  OK ${step.table}: no matching parent rows`);
        }
      }
    } catch (err) {
      console.log(`  ! ${step.table}: ${err.message}`);
    }
  }

  // Also clean up any test users (e2e_test_*@test.com)
  console.log("\n  Checking for stale test users...");
  const { data: users } = await supabase.auth.admin.listUsers({ perPage: 100 });
  if (users?.users) {
    const testUsers = users.users.filter(u => u.email?.startsWith("e2e_test_"));
    for (const u of testUsers) {
      const { error } = await supabase.auth.admin.deleteUser(u.id);
      if (error) {
        console.log(`  ! user ${u.email}: ${error.message}`);
      } else {
        console.log(`  OK user ${u.email}: deleted`);
      }
    }
    if (testUsers.length === 0) {
      console.log("  OK No stale test users found");
    }
  }

  console.log("\nCleanup complete!");
}

cleanup().catch(console.error);
