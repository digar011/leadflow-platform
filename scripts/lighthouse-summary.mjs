#!/usr/bin/env node

/**
 * Lighthouse Summary Script
 *
 * Parses Lighthouse CI results from the filesystem and prints a summary table.
 * Used in CI and locally after running `lhci collect`.
 *
 * Usage:
 *   node scripts/lighthouse-summary.mjs [results-dir]
 *   Default results-dir: ./lighthouse-results
 */

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const resultsDir = process.argv[2] || "./lighthouse-results";

const THRESHOLDS = {
  performance: 80,
  accessibility: 90,
  "best-practices": 90,
  seo: 90,
};

function scoreColor(score, category) {
  const threshold = THRESHOLDS[category] || 80;
  const pct = Math.round(score * 100);
  if (pct >= threshold) return `\x1b[32m${pct}\x1b[0m`; // green
  if (pct >= threshold - 15) return `\x1b[33m${pct}\x1b[0m`; // amber
  return `\x1b[31m${pct}\x1b[0m`; // red
}

function scoreEmoji(score, category) {
  const threshold = THRESHOLDS[category] || 80;
  const pct = Math.round(score * 100);
  if (pct >= threshold) return `${pct} ✅`;
  if (pct >= threshold - 15) return `${pct} ⚠️`;
  return `${pct} ❌`;
}

async function main() {
  let files;
  try {
    files = await readdir(resultsDir);
  } catch {
    console.error(`Could not read results directory: ${resultsDir}`);
    console.error("Run Lighthouse first: npx lhci collect");
    process.exit(1);
  }

  const jsonFiles = files.filter(
    (f) => f.startsWith("lhr-") && f.endsWith(".json")
  );

  if (jsonFiles.length === 0) {
    console.error("No Lighthouse results found.");
    console.error("Run: npx lhci collect");
    process.exit(1);
  }

  // Group results by URL and average the scores
  const urlResults = {};

  for (const file of jsonFiles) {
    const content = await readFile(join(resultsDir, file), "utf-8");
    const lhr = JSON.parse(content);
    const url = new URL(lhr.finalUrl || lhr.requestedUrl);
    const path = url.pathname;

    if (!urlResults[path]) {
      urlResults[path] = { runs: 0, totals: {} };
    }

    const entry = urlResults[path];
    entry.runs++;

    for (const [key, cat] of Object.entries(lhr.categories)) {
      if (!entry.totals[key]) entry.totals[key] = 0;
      entry.totals[key] += cat.score || 0;
    }
  }

  // Check if running in CI (GitHub Actions)
  const isCI = process.env.CI === "true" || process.env.GITHUB_ACTIONS;

  console.log("\n=== Lighthouse Audit Summary ===\n");

  const categories = ["performance", "accessibility", "best-practices", "seo"];

  if (isCI) {
    // GitHub Actions job summary (markdown)
    let md = "## Lighthouse Audit Results\n\n";
    md += "| Page | Performance | Accessibility | Best Practices | SEO |\n";
    md += "|------|------------|---------------|----------------|-----|\n";

    for (const [path, data] of Object.entries(urlResults).sort()) {
      const scores = categories.map((cat) => {
        const avg = data.totals[cat] / data.runs;
        return scoreEmoji(avg, cat);
      });
      md += `| \`${path}\` | ${scores.join(" | ")} |\n`;
    }

    md += `\n_Averaged over ${Object.values(urlResults)[0]?.runs || 0} runs per page._\n`;

    // Write to GitHub step summary if available
    if (process.env.GITHUB_STEP_SUMMARY) {
      const { appendFile } = await import("node:fs/promises");
      await appendFile(process.env.GITHUB_STEP_SUMMARY, md);
      console.log("Summary written to GitHub Actions step summary.");
    }

    console.log(md);
  } else {
    // Terminal output with colors
    const header = [
      "Page".padEnd(25),
      "Perf".padStart(6),
      "A11y".padStart(6),
      "BP".padStart(6),
      "SEO".padStart(6),
    ].join(" | ");

    console.log(header);
    console.log("-".repeat(header.length));

    for (const [path, data] of Object.entries(urlResults).sort()) {
      const scores = categories.map((cat) => {
        const avg = data.totals[cat] / data.runs;
        return scoreColor(avg, cat).padStart(6 + 9); // +9 for ANSI codes
      });
      console.log(
        `${path.padEnd(25)} | ${scores.join(" | ")}`
      );
    }

    console.log(
      `\nAveraged over ${Object.values(urlResults)[0]?.runs || 0} runs per page.`
    );
    console.log(
      `\nThresholds: Performance >= ${THRESHOLDS.performance}, Accessibility >= ${THRESHOLDS.accessibility}, Best Practices >= ${THRESHOLDS["best-practices"]}, SEO >= ${THRESHOLDS.seo}`
    );
  }

  // Exit with error if any category fails hard threshold
  let hasFailure = false;
  for (const [path, data] of Object.entries(urlResults)) {
    for (const cat of categories) {
      const avg = (data.totals[cat] / data.runs) * 100;
      if (cat === "accessibility" && avg < THRESHOLDS.accessibility) {
        console.error(
          `\n❌ FAIL: ${path} accessibility score (${Math.round(avg)}) below threshold (${THRESHOLDS.accessibility})`
        );
        hasFailure = true;
      }
    }
  }

  if (hasFailure) {
    console.error(
      "\nAccessibility failures are blocking. Fix the issues above."
    );
    process.exit(1);
  }

  console.log("\n✅ All critical thresholds passed.");
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
