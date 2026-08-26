#!/usr/bin/env node
/**
 * Dependency audit gate (CI) — fails on CRITICAL advisories only.
 *
 * High advisories are tracked in SECURITY.md (dev-tooling / transitive
 * / non-runtime) and must not block merges; they are printed as a
 * baseline for the reviewer.
 *
 * NOTE: `pnpm audit` exits 1 whenever ANY vulnerability exists, so we
 * use spawnSync and read stdout regardless of the exit code — the JSON
 * report is still written before the non-zero exit.
 */
import { spawnSync } from 'node:child_process';

const res = spawnSync('pnpm', ['audit', '--json'], {
  encoding: 'utf8',
  shell: process.platform === 'win32', // pnpm is a shell shim on Linux CI runners
});

if (!res.stdout) {
  console.error('FAIL: pnpm audit produced no output (status', res.status, ')');
  process.exit(1);
}

let report;
try {
  report = JSON.parse(res.stdout);
} catch {
  console.error('FAIL: could not parse pnpm audit output');
  process.exit(1);
}

const vulns = report.metadata?.vulnerabilities ?? {};
const { critical = 0, high = 0, moderate = 0, low = 0 } = vulns;

console.log(`audit: ${critical} critical / ${high} high / ${moderate} moderate / ${low} low`);
if (critical > 0) {
  console.error(`FAIL: ${critical} critical advisories found — resolve before merging.`);
  process.exit(1);
}
console.log('audit gate passed (no critical advisories)');
