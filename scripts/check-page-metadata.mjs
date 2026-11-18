#!/usr/bin/env node
/**
 * W6-1 — page-metadata gate: every PUBLIC page.tsx must export
 * generateMetadata (or a static `metadata`), so no new public page can
 * ship without SEO metadata. Private groups (admin, tech, auth,
 * customer, technician, vendor, api) are out of scope — those are
 * noindex surfaces. Files listed in scripts/static-page-metadata-allowlist.txt
 * are the not-yet-migrated queue (ratchet: the list only shrinks).
 *
 * Usage: node scripts/check-page-metadata.mjs [--check] [--files]
 *   --check   CI gate mode: exit 1 when unmigrated pages exist outside
 *             the allowlist (new pages without metadata fail immediately)
 *   --files   print only the unmigrated file list (allowlist seeding)
 * The CI gate runs through check-page-metadata.test.mjs (node --test
 * scripts/*.test.mjs in the Architecture Gates job).
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

const APP_ROOT = join(process.cwd(), 'apps/web/src/app');
const ALLOWLIST = join(process.cwd(), 'scripts/static-page-metadata-allowlist.txt');

// Private/functional groups never get indexed — excluded from the gate.
const EXCLUDED_GROUPS = new Set(['(auth)', '(customer)', '(technician)', '(vendor)']);
const EXCLUDED_DIRS = new Set(['admin', 'api', 'tech']);

const METADATA_RE = /export\s+(async\s+)?(const|function)\s+(metadata|generateMetadata)\b/;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (EXCLUDED_GROUPS.has(name) || EXCLUDED_DIRS.has(name)) continue;
      walk(p, out);
    } else if (name === 'page.tsx') {
      out.push(p);
    }
  }
  return out;
}

export function scan(appRoot = APP_ROOT, allowlistPath = ALLOWLIST) {
  const allow = existsSync(allowlistPath)
    ? new Set(
        readFileSync(allowlistPath, 'utf8')
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean),
      )
    : new Set();
  const unmigrated = [];
  for (const file of walk(appRoot)) {
    const rel = relative(process.cwd(), file).split('\\').join('/');
    if (allow.has(rel)) continue;
    const src = readFileSync(file, 'utf8');
    if (!METADATA_RE.test(src)) unmigrated.push(rel);
  }
  unmigrated.sort();
  return { unmigrated };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const { unmigrated } = scan();
  if (process.argv.includes('--files')) {
    for (const f of unmigrated) console.log(f);
  } else {
    console.log(`public pages without metadata (outside allowlist): ${unmigrated.length}`);
    for (const f of unmigrated) console.log(`  ${f}`);
  }
  if (process.argv.includes('--check') && unmigrated.length > 0) process.exitCode = 1;
}
