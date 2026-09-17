/**
 * Dark light-fix sweep (ENHANCEMENT_PLAN 5.3).
 *
 * Adds dark: twins to light-only hardcoded colors inside className
 * literals. Rules:
 *   - class lists that already contain ANY `dark:` token are left alone
 *     (prior sweeps touched them — conservative guard, same spirit as the
 *     (?!dark:)/(?<!dark:) regexes)
 *   - map table below appends the dark twin right after the light token
 *   - solid saturated backgrounds (bg-*-400..700) and text-white/bg-black
 *     are INTENTIONAL in both themes — untouched
 *   - EOLs preserved
 *
 * Usage: node scripts/dark-light-fix-sweep.mjs [--dry]
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DRY = process.argv.includes('--dry');
const ROOTS = [join(process.cwd(), 'apps', 'web', 'src')];
const EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mdx']);

const MAP = [
  ['text-green-700', 'dark:text-green-300'],
  ['text-green-600', 'dark:text-green-400'],
  ['text-green-500', 'dark:text-green-400'],
  ['text-amber-700', 'dark:text-amber-300'],
  ['text-amber-600', 'dark:text-amber-400'],
  ['text-amber-500', 'dark:text-amber-400'],
  ['text-red-700', 'dark:text-red-300'],
  ['text-red-600', 'dark:text-red-400'],
  ['text-red-500', 'dark:text-red-400'],
  ['text-blue-600', 'dark:text-blue-400'],
  ['text-pink-700', 'dark:text-pink-300'],
  ['text-pink-600', 'dark:text-pink-300'],
  ['text-yellow-700', 'dark:text-yellow-300'],
  ['text-yellow-500', 'dark:text-yellow-400'],
  ['text-gray-300', 'dark:text-gray-600'],
  ['bg-gray-300', 'dark:bg-gray-600'],
  ['bg-red-100', 'dark:bg-red-950'],
  ['bg-amber-100', 'dark:bg-amber-950'],
  ['bg-green-100', 'dark:bg-green-950'],
  ['bg-green-50', 'dark:bg-green-950'],
  ['bg-green-200', 'dark:bg-green-900'],
  ['bg-pink-100', 'dark:bg-pink-950'],
  ['bg-yellow-100', 'dark:bg-yellow-950'],
  ['bg-yellow-200', 'dark:bg-yellow-900'],
  ['bg-gray-800', 'dark:bg-gray-700'],
];

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (EXT.has(p.slice(p.lastIndexOf('.')))) out.push(p);
  }
  return out;
}

function sweepClassList(str) {
  if (/\bdark:/.test(str)) return str;
  const parts = str.split(/\s+/);
  const out = [];
  for (const tok of parts) {
    out.push(tok);
    // Support variant prefixes: hover:text-red-500 -> dark:hover:text-red-400
    const bare = tok.replace(/^[a-z-]+:/, '');
    const hit = MAP.find(([light]) => light === bare);
    if (hit) {
      const variant = tok.slice(0, tok.length - bare.length);
      out.push(variant ? `${variant}${hit[1]}` : hit[1]);
    }
  }
  return out.join(' ');
}

const QUOTE_RE = /"([^"\n]*)"|'([^'\n]*)'/g;
const TICK_RE = /`([^`\n]*)`/g;

function sweepLine(line) {
  let m;
  QUOTE_RE.lastIndex = 0;
  let changed = false;
  const edits = [];
  while ((m = QUOTE_RE.exec(line))) {
    const inner = m[0].slice(1, -1);
    const swept = sweepClassList(inner);
    if (swept !== inner) {
      changed = true;
      edits.push({
        start: m.index,
        end: m.index + m[0].length,
        text: m[0][0] + swept + m[0][m[0].length - 1],
      });
    }
  }
  for (let k = edits.length - 1; k >= 0; k--) {
    const e = edits[k];
    line = line.slice(0, e.start) + e.text + line.slice(e.end);
  }
  const edits2 = [];
  TICK_RE.lastIndex = 0;
  while ((m = TICK_RE.exec(line))) {
    const content = m[0].slice(1, -1);
    if (!content.includes('${')) continue;
    if (/\bdark:/.test(content)) continue;
    const swept = sweepClassList(content);
    if (swept !== content) {
      changed = true;
      edits2.push({ start: m.index, end: m.index + m[0].length, text: '`' + swept + '`' });
    }
  }
  for (let k = edits2.length - 1; k >= 0; k--) {
    const e = edits2[k];
    line = line.slice(0, e.start) + e.text + line.slice(e.end);
  }
  return changed ? line : undefined;
}

let totalFiles = 0;
let totalLines = 0;
for (const root of ROOTS) {
  for (const file of walk(root)) {
    const src = readFileSync(file, 'utf8');
    const eol = src.includes('\r\n') ? '\r\n' : '\n';
    const lines = src.split(/\r?\n/);
    let changed = 0;
    for (let i = 0; i < lines.length; i++) {
      const swept = sweepLine(lines[i]);
      if (swept !== undefined) {
        lines[i] = swept;
        changed++;
      }
    }
    if (changed > 0) {
      totalFiles++;
      totalLines += changed;
      if (!DRY) writeFileSync(file, lines.join(eol));
      console.log(`${changed}\t${file.replace(process.cwd() + '\\', '')}`);
    }
  }
}
console.log(
  `\nfiles changed: ${totalFiles}, lines changed: ${totalLines}${DRY ? ' (DRY RUN)' : ''}`,
);
