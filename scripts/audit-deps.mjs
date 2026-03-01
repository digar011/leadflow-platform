#!/usr/bin/env node

/**
 * Local dependency audit script.
 * Run: npm run audit-deps
 *
 * Checks for:
 * - Known vulnerabilities (npm audit)
 * - Outdated packages (npm outdated)
 *
 * Per CLAUDE.md: Critical vulns within 24h, high within 1 week.
 */

import { execSync } from "node:child_process";

const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const GREEN = "\x1b[32m";
const CYAN = "\x1b[36m";
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";

console.log(`\n${BOLD}${CYAN}=== Dependency Audit ===${RESET}\n`);

// --- Vulnerability Audit ---
console.log(`${BOLD}1. Vulnerability Scan${RESET}`);
try {
  const auditJson = execSync("npm audit --json 2>/dev/null", {
    encoding: "utf-8",
    stdio: ["pipe", "pipe", "pipe"],
  });

  const audit = JSON.parse(auditJson);
  const vulns = audit.metadata?.vulnerabilities || {};

  const critical = vulns.critical || 0;
  const high = vulns.high || 0;
  const moderate = vulns.moderate || 0;
  const low = vulns.low || 0;
  const total = vulns.total || 0;

  if (total === 0) {
    console.log(`   ${GREEN}No vulnerabilities found.${RESET}\n`);
  } else {
    console.log(`   ${total > 0 ? RED : GREEN}Vulnerabilities found: ${total}${RESET}`);
    if (critical > 0) console.log(`   ${RED}  Critical: ${critical} (fix within 24 hours)${RESET}`);
    if (high > 0) console.log(`   ${RED}  High:     ${high} (fix within 1 week)${RESET}`);
    if (moderate > 0) console.log(`   ${YELLOW}  Moderate: ${moderate}${RESET}`);
    if (low > 0) console.log(`   Low:     ${low}`);
    console.log();

    if (critical > 0 || high > 0) {
      console.log(`   ${RED}${BOLD}Action required:${RESET}`);
      console.log(`   Run: ${CYAN}npm audit fix${RESET}`);
      console.log(`   Or:  ${CYAN}npm audit${RESET} for details\n`);
    }
  }
} catch (error) {
  // npm audit exits non-zero when vulnerabilities exist
  try {
    const output = error.stdout || "";
    const audit = JSON.parse(output);
    const vulns = audit.metadata?.vulnerabilities || {};
    const total = vulns.total || 0;
    const critical = vulns.critical || 0;
    const high = vulns.high || 0;
    const moderate = vulns.moderate || 0;
    const low = vulns.low || 0;

    console.log(`   ${RED}Vulnerabilities found: ${total}${RESET}`);
    if (critical > 0) console.log(`   ${RED}  Critical: ${critical} (fix within 24 hours)${RESET}`);
    if (high > 0) console.log(`   ${RED}  High:     ${high} (fix within 1 week)${RESET}`);
    if (moderate > 0) console.log(`   ${YELLOW}  Moderate: ${moderate}${RESET}`);
    if (low > 0) console.log(`   Low:     ${low}`);
    console.log();
  } catch {
    console.log(`   ${YELLOW}Could not parse audit output. Run 'npm audit' manually.${RESET}\n`);
  }
}

// --- Outdated Packages ---
console.log(`${BOLD}2. Outdated Packages${RESET}`);
try {
  const outdatedJson = execSync("npm outdated --json 2>/dev/null", {
    encoding: "utf-8",
    stdio: ["pipe", "pipe", "pipe"],
  });

  const outdated = JSON.parse(outdatedJson || "{}");
  const packages = Object.entries(outdated);

  if (packages.length === 0) {
    console.log(`   ${GREEN}All packages are up to date.${RESET}\n`);
  } else {
    console.log(`   ${YELLOW}${packages.length} package(s) have updates available:${RESET}\n`);
    console.log(`   ${"Package".padEnd(35)} ${"Current".padEnd(12)} ${"Wanted".padEnd(12)} Latest`);
    console.log(`   ${"─".repeat(35)} ${"─".repeat(12)} ${"─".repeat(12)} ${"─".repeat(12)}`);

    for (const [name, info] of packages) {
      const current = info.current || "?";
      const wanted = info.wanted || "?";
      const latest = info.latest || "?";
      const isMajor = current.split(".")[0] !== latest.split(".")[0];
      const color = isMajor ? RED : YELLOW;
      console.log(`   ${color}${name.padEnd(35)} ${current.padEnd(12)} ${wanted.padEnd(12)} ${latest}${RESET}`);
    }
    console.log();
  }
} catch (error) {
  // npm outdated exits non-zero when packages are outdated
  try {
    const output = error.stdout || "{}";
    const outdated = JSON.parse(output);
    const packages = Object.entries(outdated);

    if (packages.length === 0) {
      console.log(`   ${GREEN}All packages are up to date.${RESET}\n`);
    } else {
      console.log(`   ${YELLOW}${packages.length} package(s) have updates available:${RESET}\n`);
      console.log(`   ${"Package".padEnd(35)} ${"Current".padEnd(12)} ${"Wanted".padEnd(12)} Latest`);
      console.log(`   ${"─".repeat(35)} ${"─".repeat(12)} ${"─".repeat(12)} ${"─".repeat(12)}`);

      for (const [name, info] of packages) {
        const current = info.current || "?";
        const wanted = info.wanted || "?";
        const latest = info.latest || "?";
        const isMajor = current.split(".")[0] !== latest.split(".")[0];
        const color = isMajor ? RED : YELLOW;
        console.log(`   ${color}${name.padEnd(35)} ${current.padEnd(12)} ${wanted.padEnd(12)} ${latest}${RESET}`);
      }
      console.log();
    }
  } catch {
    console.log(`   ${YELLOW}Could not parse outdated output. Run 'npm outdated' manually.${RESET}\n`);
  }
}

console.log(`${BOLD}${CYAN}=== Audit Complete ===${RESET}\n`);
