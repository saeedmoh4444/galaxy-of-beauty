/**
 * Phase 1 — gray→semantic token sweep.
 *
 * Replaces hardcoded gray-* Tailwind classes with semantic tokens across
 * apps/web/src and packages/ui/src. Deliberately conservative:
 *
 * - Dark-mode PAIRS (text-gray-900 dark:text-gray-100) are replaced first.
 * - Opacity-suffixed shades (bg-gray-900/50 overlays) are LEFT — semantic
 *   tokens use plain var() without <alpha-value>, so opacity modifiers
 *   would not compile. Warm gray now keeps them on-palette.
 * - Always-dark bands (single bg-gray-800/900/950, single text-gray-50…
 *   text-gray-300) are LEFT — intentional dark sections / on-dark text.
 * - Gradient stops (from-/to-/via-gray-*) are LEFT — decorative.
 * - fill-/stroke-gray-* are LEFT — icon tints; warm gray keeps them right.
 *
 * Usage: node scripts/design-token-sweep.mjs [--dry-run]
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOTS = ['apps/web/src', 'packages/ui/src'];
const EXTS = new Set(['.tsx', '.ts', '.jsx', '.js', '.mdx']);
const DRY = process.argv.includes('--dry-run');

// Ordered: pairs first (most specific), then singles. Within singles,
// shades are guarded by a negative lookahead so text-gray-50 never matches
// text-gray-500, and /-suffixed opacity shades are skipped.
const RULES = [
  // ── text pairs ────────────────────────────────────────────
  ['text-gray-900 dark:text-gray-100', 'text-text-primary'],
  ['text-gray-900 dark:text-gray-50', 'text-text-primary'],
  ['text-gray-800 dark:text-gray-100', 'text-text-primary'],
  ['text-gray-800 dark:text-gray-200', 'text-text-primary'],
  ['text-gray-700 dark:text-gray-200', 'text-text-secondary'],
  ['text-gray-700 dark:text-gray-300', 'text-text-secondary'],
  ['text-gray-600 dark:text-gray-300', 'text-text-secondary'],
  ['text-gray-600 dark:text-gray-400', 'text-text-secondary'],
  ['text-gray-500 dark:text-gray-400', 'text-text-secondary'],
  ['text-gray-500 dark:text-gray-500', 'text-text-secondary'],
  ['text-gray-400 dark:text-gray-500', 'text-text-tertiary'],
  ['text-gray-400 dark:text-gray-600', 'text-text-tertiary'],
  ['text-gray-300 dark:text-gray-600', 'text-text-tertiary'],
  // ── bg pairs ──────────────────────────────────────────────
  ['bg-white dark:bg-gray-950', 'bg-surface-elevated'],
  ['bg-white dark:bg-gray-900', 'bg-surface-elevated'],
  ['bg-white dark:bg-gray-800', 'bg-surface-elevated'],
  ['bg-white dark:bg-gray-700', 'bg-surface-elevated'],
  ['bg-gray-50 dark:bg-gray-950', 'bg-surface'],
  ['bg-gray-50 dark:bg-gray-900', 'bg-surface'],
  ['bg-gray-50 dark:bg-gray-800', 'bg-surface-muted'],
  ['bg-gray-100 dark:bg-gray-950', 'bg-surface-muted'],
  ['bg-gray-100 dark:bg-gray-900', 'bg-surface-muted'],
  ['bg-gray-100 dark:bg-gray-800', 'bg-surface-muted'],
  ['bg-gray-200 dark:bg-gray-800', 'bg-surface-muted'],
  ['bg-gray-200 dark:bg-gray-700', 'bg-surface-muted'],
  // ── border pairs ──────────────────────────────────────────
  ['border-gray-200 dark:border-gray-900', 'border-edge'],
  ['border-gray-200 dark:border-gray-800', 'border-edge'],
  ['border-gray-200 dark:border-gray-700', 'border-edge'],
  ['border-gray-300 dark:border-gray-700', 'border-edge'],
  ['border-gray-300 dark:border-gray-600', 'border-edge'],
  ['border-gray-100 dark:border-gray-800', 'border-edge-muted'],
  ['border-gray-100 dark:border-gray-700', 'border-edge-muted'],
  // ── hover pairs ───────────────────────────────────────────
  ['hover:bg-gray-100 dark:hover:bg-gray-800', 'hover:bg-surface-muted'],
  ['hover:bg-gray-100 dark:hover:bg-gray-700', 'hover:bg-surface-muted'],
  ['hover:bg-gray-50 dark:hover:bg-gray-900', 'hover:bg-surface-muted'],
  ['hover:bg-gray-50 dark:hover:bg-gray-800', 'hover:bg-surface-muted'],
  ['hover:text-gray-900 dark:hover:text-gray-100', 'hover:text-text-primary'],
  ['hover:text-gray-600 dark:hover:text-gray-300', 'hover:text-text-secondary'],
  // ── divide pairs ──────────────────────────────────────────
  ['divide-gray-200 dark:divide-gray-800', 'divide-edge'],
  ['divide-gray-200 dark:divide-gray-700', 'divide-edge'],
  ['divide-gray-100 dark:divide-gray-800', 'divide-edge-muted'],
].map(([from, to]) => [from, to, true]);

// ── singles (light-only context, opacity-suffixed skipped) ──
// token here is the suffix AFTER the prefix ('text-' + 'text-primary' = text-text-primary).
for (const [prefix, shade, token] of [
  ['text', 900, 'text-primary'],
  ['text', 800, 'text-primary'],
  ['text', 700, 'text-secondary'],
  ['text', 600, 'text-secondary'],
  ['text', 500, 'text-secondary'],
  ['text', 400, 'text-tertiary'],
  ['bg', 50, 'surface-muted'],
  ['bg', 100, 'surface-muted'],
  ['bg', 200, 'surface-muted'],
  ['border', 200, 'edge'],
  ['border', 300, 'edge'],
  ['border', 100, 'edge-muted'],
  ['border', 50, 'edge-muted'],
  ['divide', 200, 'edge'],
  ['divide', 100, 'edge-muted'],
  ['ring', 300, 'edge'],
  ['ring', 200, 'edge'],
  ['placeholder', 500, 'text-tertiary'],
  ['placeholder', 400, 'text-tertiary'],
]) {
  RULES.push([`${prefix}-gray-${shade}(?![\\d/])`, `${prefix}-${token}`, false]);
}

// ── purple→brand (legacy violet complements — old brand WAS violet) ──
// Rose Blush unified palette: purple tints become rose brand tints.
for (const prefix of ['text', 'bg', 'border', 'ring', 'from', 'via', 'to', 'fill', 'stroke']) {
  RULES.push([
    `(?<![a-zA-Z0-9-])${prefix}-purple-([0-9]{2,3})(?![\\d/])`,
    `${prefix}-brand-$1`,
    false,
  ]);
}

/** Walk a dir for source files. */
function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) yield* walk(full);
    else if (EXTS.has(entry.slice(entry.lastIndexOf('.')))) yield full;
  }
}

const report = new Map(); // file -> [ruleLabel, count][]
let total = 0;

for (const root of ROOTS) {
  for (const file of walk(root)) {
    const original = readFileSync(file, 'utf8');
    let content = original;
    const changes = [];

    for (const [from, to, isPair] of RULES) {
      const re = isPair ? new RegExp(escapeRegex(from), 'g') : new RegExp(from, 'g');
      const before = content;
      content = content.replace(re, to);
      const hits = countMatches(before, re);
      if (hits > 0) changes.push([from, hits, to]);
    }

    if (content !== original) {
      if (!DRY) writeFileSync(file, content, 'utf8');
      report.set(relative(process.cwd(), file), changes);
      total += changes.reduce((sum, [, n]) => sum + n, 0);
    }
  }
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function countMatches(text, re) {
  return (text.match(re) ?? []).length;
}

// ── summary ────────────────────────────────────────────────
const byRule = new Map();
for (const changes of report.values()) {
  for (const [from, n] of changes) {
    byRule.set(from, (byRule.get(from) ?? 0) + n);
  }
}

console.log(`${DRY ? '[DRY RUN] ' : ''}${report.size} files, ${total} replacements\n`);
console.log('Per-rule totals:');
for (const [rule, n] of [...byRule.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(5)}  ${rule}  →  ${ruleTarget(rule)}`);
}
console.log('\nFiles changed:');
for (const [file, changes] of [...report.entries()].sort()) {
  console.log(`  ${file}  (${changes.reduce((s, [, n]) => s + n, 0)})`);
}

function ruleTarget(rule) {
  const found = RULES.find(([from]) => from === rule);
  return found ? found[1] : '?';
}
