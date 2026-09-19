#!/usr/bin/env node
/**
 * FE-007 size budget gate.
 *
 * Reads the Next.js (Turbopack) route bundle stats
 * (apps/web/.next/diagnostics/route-bundle-stats.json: route,
 * firstLoadUncompressedJsBytes, firstLoadChunkPaths[]) and measures each
 * route's real gzipped First-Load JS by gzipping its chunks (level 9) — the
 * same convention FE-007 budgets are stated in (docs/frontend/performance-budgets.md).
 *
 * Routes are classified structurally from apps/web/src/app page files:
 *   (public)/root/offline → public (100 KB), (auth) → auth (100 KB),
 *   (customer) → dashboard (150 KB), admin/tech/(technician) → admin (200 KB);
 *   api/*, sitemap.xml, _not-found, _global-error are excluded.
 *
 * Gate semantics: today's measured reality (~600+ KB per route — one shared
 * tRPC/API-client chunk set) far exceeds the FE-007 targets, so by default the
 * gate enforces a REGRESSION baseline (scripts/size-baseline.json): a class
 * fails only when its worst route exceeds baseline × (1 + tolerance). Set
 * STRICT=1 to enforce the FE-007 caps directly (the target once the shared
 * bundle is slimmed). The gate never skips silently: missing stats/chunks
 * are hard failures.
 *
 * Usage: node scripts/check-size-budgets.mjs [--web-root dir] [--stats file]
 *        [--baseline file] [--tolerance n]
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

export const FE_007_BUDGETS = { public: 100, auth: 100, dashboard: 150, admin: 200 };

const PAGE_FILES = ['page.tsx', 'page.ts', 'page.jsx', 'page.js'];
const GROUP_CLASSES = {
  '(public)': 'public',
  '(auth)': 'auth',
  '(customer)': 'dashboard',
  '(technician)': 'admin',
};
const LITERAL_CLASSES = { admin: 'admin', tech: 'admin' };
const EXCLUDED_EXACT = ['/sitemap.xml', '/_not-found', '/_global-error'];
const EXCLUDED_PREFIXES = ['/api/', '/_next/'];

export const isExcludedRoute = (route) =>
  EXCLUDED_EXACT.includes(route) || EXCLUDED_PREFIXES.some((p) => route.startsWith(p));

const classForSegments = (segments) => {
  const first = segments[0];
  if (!first) return 'public';
  if (first in GROUP_CLASSES) return GROUP_CLASSES[first];
  if (first in LITERAL_CLASSES) return LITERAL_CLASSES[first];
  return 'public';
};

/**
 * Walk an app dir for page files → Map<route, budget class>. Route groups
 * `(name)` are stripped from the URL but decide the class; dynamic segments
 * stay literal (`[id]`) so they match the stats file exactly.
 */
export function collectPageRoutes(appDir) {
  const out = new Map();
  const walk = (dir, segments) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(abs, [...segments, entry.name]);
      else if (PAGE_FILES.includes(entry.name)) {
        const urlSegments = segments.filter((s) => !/^\(.*\)$/.test(s));
        out.set(`/${urlSegments.join('/')}`, classForSegments(segments));
      }
    }
  };
  walk(appDir, []);
  return out;
}

/**
 * Evaluate the stats file against baseline (or FE-007 budgets when strict).
 * Throws on missing stats or missing chunks — the gate never skips silently.
 */
export function evaluate({
  webRoot,
  appDir,
  statsPath,
  baseline,
  tolerance = 0.05,
  strict = false,
}) {
  if (!fs.existsSync(statsPath)) {
    throw new Error(
      `missing ${statsPath} — run: pnpm --filter @galaxy/web build (the FE-007 gate never skips silently)`,
    );
  }
  let stats;
  try {
    stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
  } catch {
    throw new Error(`unparseable ${statsPath} — rebuild the web app`);
  }
  if (!Array.isArray(stats)) throw new Error(`${statsPath} is not an array — rebuild the web app`);

  const classes = collectPageRoutes(appDir);
  const perClass = {};
  for (const cls of Object.keys(FE_007_BUDGETS)) perClass[cls] = { worstKB: 0, worstRoute: null };
  const warnings = [];
  const unmatched = [];

  for (const entry of stats) {
    const route = String(entry.route).replaceAll('\\', '/');
    if (isExcludedRoute(route)) continue;
    const cls = classes.get(route) ?? 'public';
    if (!classes.has(route)) unmatched.push(route);

    let uncompressedSum = 0;
    let gzSum = 0;
    for (const chunkRel of entry.firstLoadChunkPaths ?? []) {
      const chunkPath = path.join(webRoot, String(chunkRel).replaceAll('\\', '/'));
      if (!fs.existsSync(chunkPath)) {
        throw new Error(`chunk missing for route ${route}: ${chunkPath} — rebuild the web app`);
      }
      const size = fs.statSync(chunkPath).size;
      uncompressedSum += size;
      gzSum += zlib.gzipSync(fs.readFileSync(chunkPath), { level: 9 }).length;
    }

    const claimed = entry.firstLoadUncompressedJsBytes ?? 0;
    if (claimed > 0 && Math.abs(claimed - uncompressedSum) / claimed > 0.02) {
      warnings.push(
        `${route}: stats claim ${claimed} B uncompressed but chunks sum to ${uncompressedSum} B`,
      );
    }

    const routeKB = gzSum / 1024;
    if (routeKB > perClass[cls].worstKB) {
      perClass[cls].worstKB = routeKB;
      perClass[cls].worstRoute = route;
    }
  }

  const violations = [];
  for (const cls of Object.keys(FE_007_BUDGETS)) {
    const { worstKB, worstRoute } = perClass[cls];
    if (!worstRoute) continue;
    const limit = strict ? FE_007_BUDGETS[cls] : (baseline?.[cls] ?? 0) * (1 + tolerance);
    if (worstKB > limit) {
      const source = strict
        ? `FE-007 budget ${FE_007_BUDGETS[cls]} KB`
        : `baseline ${(baseline?.[cls] ?? 0).toFixed(2)} KB × ${(1 + tolerance).toFixed(2)}`;
      violations.push(
        `${cls}: ${worstRoute} (${worstKB.toFixed(2)} KB gzipped) exceeds limit ${limit.toFixed(2)} KB (${source})`,
      );
    }
  }
  return { perClass, violations, warnings, unmatched };
}

export function main() {
  const args = process.argv.slice(2);
  const opt = (flag, def) => {
    const i = args.indexOf(flag);
    return i !== -1 && args[i + 1] ? args[i + 1] : def;
  };
  const webRoot = path.resolve(opt('--web-root', 'apps/web'));
  const appDir = path.resolve(opt('--app-dir', path.join(webRoot, 'src', 'app')));
  const statsPath = path.resolve(
    opt('--stats', path.join(webRoot, '.next', 'diagnostics', 'route-bundle-stats.json')),
  );
  const baselinePath = path.resolve(opt('--baseline', path.join('scripts', 'size-baseline.json')));
  const tolerance = Number(opt('--tolerance', '0.05'));
  const strict = process.env.STRICT === '1';

  if (!fs.existsSync(baselinePath)) {
    console.error(`FAIL: missing baseline ${baselinePath}`);
    process.exit(1);
  }
  const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));

  const res = evaluate({ webRoot, appDir, statsPath, baseline, tolerance, strict });

  console.log(`size budget gate (${strict ? 'STRICT FE-007 budgets' : 'regression baseline'}):`);
  for (const cls of Object.keys(FE_007_BUDGETS)) {
    const { worstKB, worstRoute } = res.perClass[cls];
    const budget = FE_007_BUDGETS[cls];
    const note = worstRoute ? `${worstRoute} ${worstKB.toFixed(2)} KB` : 'no routes';
    console.log(
      `  ${cls.padEnd(9)} worst ${note}  (FE-007 target ${budget} KB, baseline ${(baseline?.[cls] ?? 0).toFixed(2)} KB)`,
    );
  }
  for (const w of res.warnings) console.warn(`  warn: ${w}`);
  if (res.unmatched.length) {
    console.log(`  info: ${res.unmatched.length} unmatched route(s) defaulted to public`);
  }
  if (res.violations.length) {
    console.error('FAIL: size budgets exceeded:');
    for (const v of res.violations) console.error(`  - ${v}`);
    process.exit(1);
  }
  console.log('size budget gate PASSED');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
