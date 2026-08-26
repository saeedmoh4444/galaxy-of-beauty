#!/usr/bin/env node
/**
 * Dependency audit gate (CI) — fails on CRITICAL advisories only.
 *
 * High advisories are tracked in SECURITY.md (dev-tooling / transitive
 * / non-runtime) and must not block merges; they are printed as a
 * baseline for the reviewer.
 */
import { execSync } from 'node:child_process';

// execSync + shell: pnpm is a shell shim on Linux CI runners and
// execFileSync cannot spawn it directly (ENOBUFS/EACCES).
const out = execSync('pnpm audit --json', {
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'ignore'],
  shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash',
});

const report = JSON.parse(out);
const vulns = report.metadata?.vulnerabilities ?? {};
const { critical = 0, high = 0, moderate = 0, low = 0 } = vulns;

console.log(`audit: ${critical} critical / ${high} high / ${moderate} moderate / ${low} low`);
if (critical > 0) {
  console.error(`FAIL: ${critical} critical advisories found — resolve before merging.`);
  process.exit(1);
}
console.log('audit gate passed (no critical advisories)');
