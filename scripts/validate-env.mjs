#!/usr/bin/env node

/**
 * Validates that all required environment variables from .env.example
 * are present in the current environment (or .env.local).
 *
 * Usage:
 *   node scripts/validate-env.mjs          # Check .env.local against .env.example
 *   node scripts/validate-env.mjs --strict # Fail on any missing var (including optional)
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// Required env vars that must be set for the app to function
const REQUIRED_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_APP_URL",
];

// Recommended but optional - features degrade gracefully without these
const RECOMMENDED_VARS = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "RESEND_API_KEY",
];

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return null;

  const content = readFileSync(filePath, "utf-8");
  const vars = {};

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    vars[key] = value;
  }

  return vars;
}

function isPlaceholder(value) {
  if (!value) return true;
  const placeholders = [
    "your-",
    "sk_test_...",
    "pk_test_...",
    "whsec_...",
    "price_...",
    "re_...",
  ];
  return placeholders.some((p) => value.startsWith(p) || value === p);
}

function main() {
  const isStrict = process.argv.includes("--strict");

  console.log("Validating environment variables...\n");

  // Parse .env.example to get all expected vars
  const examplePath = resolve(ROOT, ".env.example");
  const exampleVars = parseEnvFile(examplePath);

  if (!exampleVars) {
    console.error("ERROR: .env.example not found at project root.");
    process.exit(1);
  }

  // Parse .env.local if it exists
  const localPath = resolve(ROOT, ".env.local");
  const localVars = parseEnvFile(localPath);

  if (!localVars) {
    console.error("ERROR: .env.local not found. Copy .env.example to .env.local and fill in values.");
    process.exit(1);
  }

  const allExampleKeys = Object.keys(exampleVars);
  const missingRequired = [];
  const missingRecommended = [];
  const missingOptional = [];
  const placeholderVars = [];
  const validVars = [];

  for (const key of allExampleKeys) {
    const value = localVars[key];
    const hasValue = value !== undefined && value !== "";

    if (!hasValue) {
      if (REQUIRED_VARS.includes(key)) {
        missingRequired.push(key);
      } else if (RECOMMENDED_VARS.includes(key)) {
        missingRecommended.push(key);
      } else {
        missingOptional.push(key);
      }
    } else if (isPlaceholder(value)) {
      placeholderVars.push(key);
      if (REQUIRED_VARS.includes(key)) {
        missingRequired.push(key);
      }
    } else {
      validVars.push(key);
    }
  }

  // Report results
  if (validVars.length > 0) {
    console.log(`  ${validVars.length} variables configured correctly`);
  }

  if (placeholderVars.length > 0) {
    console.log(`\n  WARNING: ${placeholderVars.length} variables still have placeholder values:`);
    for (const v of placeholderVars) {
      console.log(`    - ${v}`);
    }
  }

  if (missingOptional.length > 0) {
    console.log(`\n  INFO: ${missingOptional.length} optional variables not set:`);
    for (const v of missingOptional) {
      console.log(`    - ${v}`);
    }
  }

  if (missingRecommended.length > 0) {
    console.log(`\n  WARNING: ${missingRecommended.length} recommended variables not set (some features disabled):`);
    for (const v of missingRecommended) {
      console.log(`    - ${v}`);
    }
  }

  if (missingRequired.length > 0) {
    console.log(`\n  ERROR: ${missingRequired.length} required variables missing or have placeholder values:`);
    for (const v of missingRequired) {
      console.log(`    - ${v}`);
    }
    console.log("\n  The app will not start without these variables.");
    process.exit(1);
  }

  if (isStrict && (missingRecommended.length > 0 || placeholderVars.length > 0)) {
    console.log("\n  STRICT MODE: Failing due to missing recommended variables or placeholders.");
    process.exit(1);
  }

  console.log("\n  Environment validation passed.\n");
}

main();
