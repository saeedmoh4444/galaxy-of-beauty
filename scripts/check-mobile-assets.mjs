#!/usr/bin/env node
/**
 * E2 — mobile asset budgets (app-size trim).
 *
 * Caps the shipped static assets so a designer drop can never silently
 * bloat the app. Current assets total ~284 KB; the caps leave 15× headroom
 * for real content while still failing an accidental 4K video or raw PSD.
 *
 * Run: node scripts/check-mobile-assets.mjs
 * Exit 1 on violation.
 */
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

export const DEFAULT_LIMITS = {
  maxFileBytes: 1024 * 1024, // 1 MB per asset
  maxTotalBytes: 4 * 1024 * 1024, // 4 MB total
};

const ASSET_DIR = join(process.cwd(), 'apps', 'mobile', 'assets');

/**
 * Pure budget evaluation — testable without the filesystem.
 * @returns {{ ok: boolean; totalBytes: number; violations: string[] }}
 */
export function evaluateAssets(files, limits = DEFAULT_LIMITS) {
  const violations = [];
  const totalBytes = files.reduce((sum, f) => sum + f.size, 0);

  for (const f of files) {
    if (f.size > limits.maxFileBytes) {
      violations.push(
        `${f.path}: ${(f.size / 1024 / 1024).toFixed(2)} MB exceeds the ${limits.maxFileBytes / 1024 / 1024} MB per-asset cap`,
      );
    }
  }
  if (totalBytes > limits.maxTotalBytes) {
    violations.push(
      `total: ${(totalBytes / 1024 / 1024).toFixed(2)} MB exceeds the ${limits.maxTotalBytes / 1024 / 1024} MB total cap`,
    );
  }
  return { ok: violations.length === 0, totalBytes, violations };
}

function collectAssets(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) files.push(...collectAssets(p));
    else files.push({ path: relative(process.cwd(), p), size: statSync(p).size });
  }
  return files;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const files = collectAssets(ASSET_DIR);
  const result = evaluateAssets(files);
  console.log(
    `Mobile assets: ${files.length} files, ${(result.totalBytes / 1024).toFixed(0)} KB (cap ${DEFAULT_LIMITS.maxTotalBytes / 1024 / 1024} MB total / ${DEFAULT_LIMITS.maxFileBytes / 1024 / 1024} MB per asset)`,
  );
  if (!result.ok) {
    console.error('Asset budget violations:');
    for (const v of result.violations) console.error(`  ✗ ${v}`);
    process.exit(1);
  }
  console.log('PASS: asset budgets respected');
}
