/**
 * Dependency audit gate with an accepted-findings baseline.
 *
 * `pnpm audit --prod` exits 1 whenever ANY high finding exists, which
 * can never pass while the findings accepted in SECURITY.md remain.
 * This script fails only when the number of high/critical findings
 * EXCEEDS the documented baseline — i.e. new findings block the PR.
 *
 * Keep the baseline in sync with SECURITY.md.
 */
import { execSync } from 'node:child_process';

// Accepted, documented findings (see SECURITY.md "Accepted" section)
const BASELINE = { high: 7, critical: 0 };

let output;
try {
  output = execSync('pnpm audit --prod --json', {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
    maxBuffer: 16 * 1024 * 1024,
  });
} catch (error) {
  // pnpm exits 1 when findings exist; the JSON is still on stdout
  output = error.stdout ?? '';
}

let report;
try {
  report = JSON.parse(output);
} catch {
  console.error('Audit check: could not parse pnpm audit output');
  process.exit(1);
}

const counts = report.metadata?.vulnerabilities ?? {};
const high = counts.high ?? 0;
const critical = counts.critical ?? 0;

if (critical > BASELINE.critical) {
  console.error(
    `Audit check FAILED: ${critical} critical findings (baseline ${BASELINE.critical})`,
  );
  process.exit(1);
}
if (high > BASELINE.high) {
  console.error(
    `Audit check FAILED: ${high} high findings (baseline ${BASELINE.high}). ` +
      'New findings must be fixed or added to SECURITY.md with an owner, expiry, and compensating control.',
  );
  const advisories = Object.values(report.advisories ?? {});
  for (const a of advisories.filter((x) => x.severity === 'high')) {
    console.error(`  - ${a.module_name} (${a.vulnerable_versions}): ${a.title}`);
  }
  process.exit(1);
}

console.log(
  `Audit check OK: ${high} high / ${critical} critical (baseline ${BASELINE.high} / ${BASELINE.critical})`,
);
