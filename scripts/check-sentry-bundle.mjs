/**
 * B1 (PLATFORM_IMPROVEMENT_PLAN) — deterministic Sentry bundling gate.
 *
 * The sentry client config sets window.__GOB_SENTRY_READY__ after init;
 * this gate greps the PRODUCTION build output (.next) for that marker.
 * Bundle-content is the one assertion Turbopack can't rename away, and
 * it runs in seconds in the Build job — no browser, no SDK internals.
 *
 * Run after `next build`: node scripts/check-sentry-bundle.mjs
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const NEXT_DIR = join(process.cwd(), 'apps', 'web', '.next');
const MARKER = '__GOB_SENTRY_READY__';

if (!existsSync(NEXT_DIR)) {
  console.error(`FAIL: ${NEXT_DIR} not found — run next build first`);
  process.exit(1);
}

const hits = [];
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (entry.name.endsWith('.js') || entry.name.endsWith('.mjs')) {
      try {
        if (readFileSync(p, 'utf8').includes(MARKER)) hits.push(p);
      } catch {
        // binary or unreadable chunk — skip
      }
    }
  }
}

try {
  walk(join(NEXT_DIR, 'static'));
} catch (err) {
  console.error('FAIL: could not scan .next/static:', err.message);
  process.exit(1);
}

if (hits.length === 0) {
  console.error(
    `FAIL: ${MARKER} not found in the built chunks — the Sentry client config is not bundled.`,
  );
  process.exit(1);
}
console.log(`PASS: Sentry client config bundled (${hits.length} chunk(s))`);
