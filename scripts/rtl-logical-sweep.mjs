/**
 * Phase 1 — RTL logical-properties sweep.
 *
 * Replaces physical-direction Tailwind utilities with logical ones so
 * Arabic (RTL) layouts mirror correctly without per-language hacks:
 *
 *   ml-* -> ms-*   mr-* -> me-*   pl-* -> ps-*   pr-* -> pe-*
 *   left-* -> start-*   right-* -> end-*
 *   text-left -> text-start   text-right -> text-end
 *   rounded-l-* -> rounded-s-*   rounded-r-* -> rounded-e-*
 *   border-l-* -> border-s-*   border-r-* -> border-e-*
 *
 * Guards:
 * - skips opacity-suffixed and arbitrary values the same way (substring
 *   patterns are exact, so ml-4 never matches ml-40).
 * - skips inline style objects? No — style objects use camelCase, unaffected.
 *
 * Usage: node scripts/rtl-logical-sweep.mjs [--dry-run]
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOTS = ['apps/web/src', 'packages/ui/src'];
const EXTS = new Set(['.tsx', '.ts', '.jsx', '.js', '.mdx']);
const DRY = process.argv.includes('--dry-run');

// Ordered: longest/most specific first is handled by exact string match —
// Tailwind classes are space-delimited, so match on word boundaries.
const RULES = [
  ['rounded-l-', 'rounded-s-'],
  ['rounded-r-', 'rounded-e-'],
  ['border-l-', 'border-s-'],
  ['border-r-', 'border-e-'],
  ['divide-x-reverse', 'divide-x-reverse'], // no-op, documented flip-free
  ['text-left', 'text-start'],
  ['text-right', 'text-end'],
  ['ml-', 'ms-'],
  ['mr-', 'me-'],
  ['pl-', 'ps-'],
  ['pr-', 'pe-'],
  ['left-', 'start-'],
  ['right-', 'end-'],
];

// Word-boundary regex: matches e.g. "ml-4" but not "xml-4" or "ml-" inside
// other identifiers. Negative lookbehind for [a-z-] and lookahead handled
// per-rule since left/right can also end a class (text-left).
const buildRegex = (from) => {
  // text-left / text-right end with a letter: block only word chars after,
  // so mid-string occurrences followed by a space or quote still match.
  if (from === 'text-left' || from === 'text-right') {
    return new RegExp(`(?<![a-zA-Z0-9-])${from}(?![a-zA-Z0-9-])`, 'g');
  }
  return new RegExp(
    `(?<![a-zA-Z0-9-])${from}(?=[0-9a-zA-Z.\\[\\]/-])|(?<![a-zA-Z0-9-])${from}$`,
    'g',
  );
};

/** Walk a dir for source files. */
function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) yield* walk(full);
    else if (EXTS.has(entry.slice(entry.lastIndexOf('.')))) yield full;
  }
}

const report = new Map();
let total = 0;

for (const root of ROOTS) {
  for (const file of walk(root)) {
    const original = readFileSync(file, 'utf8');
    let content = original;
    const changes = [];

    for (const [from, to] of RULES) {
      if (from === to) continue;
      let hits = 0;

      const re = buildRegex(from);
      const before = content;
      content = content.replace(re, to);
      hits += (before.match(re) ?? []).length;

      // Negative utilities (-right-6 -> -end-6). The leading dash must sit at
      // a class boundary, so bg-left/bg-right stay untouched (their dash is
      // preceded by a letter).
      if (from !== 'text-left' && from !== 'text-right') {
        const negRe = new RegExp(`(?<![a-zA-Z0-9-])-${from}(?=[0-9a-zA-Z.\\[\\]/-])`, 'g');
        const beforeNeg = content;
        content = content.replace(negRe, `-${to}`);
        hits += (beforeNeg.match(negRe) ?? []).length;
      }

      if (hits > 0) changes.push([from, hits]);
    }

    if (content !== original) {
      if (!DRY) writeFileSync(file, content, 'utf8');
      report.set(relative(process.cwd(), file), changes);
      total += changes.reduce((s, [, n]) => s + n, 0);
    }
  }
}

const byRule = new Map();
for (const changes of report.values()) {
  for (const [from, n] of changes) byRule.set(from, (byRule.get(from) ?? 0) + n);
}

console.log(`${DRY ? '[DRY RUN] ' : ''}${report.size} files, ${total} replacements\n`);
for (const [rule, n] of [...byRule.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(4)}  ${rule}`);
}
console.log('\nFiles changed:');
for (const [file, changes] of [...report.entries()].sort()) {
  console.log(`  ${file}  (${changes.reduce((s, [, n]) => s + n, 0)})`);
}
