/**
 * Tokenless-pair sweep — replace hardcoded gray/white light-side classes
 * with semantic tokens (exact light-mode equivalences), then remove the now
 * redundant dark twins via the gray-sweep rule (token supplies dark value).
 *
 * Mappings (verified against apps/web/src/app/globals.css):
 *   bg-white           -> bg-surface-elevated   (light #ffffff exact)
 *   bg-gray-50         -> bg-surface            (#fbf8f9 ≈ #fdf9f7)
 *   bg-gray-100        -> bg-surface-muted      (#f4ecef ≈ #f8f0ee)
 *   text-gray-900      -> text-text-primary     (#2d1b22 exact)
 *   text-gray-500      -> text-text-secondary   (#8a6e78 exact)
 *   text-gray-400      -> text-text-tertiary    (#b3a0ab exact)
 *   border-gray-200    -> border-edge           (#eadde2 ≈ #f0e4e8)
 *   border-gray-100    -> border-edge-muted     (#f4ecef ≈ #f6ecef)
 *
 * Variant prefixes (hover:/focus:/placeholder:...) are preserved. Then
 * dark:text/bg/border-gray-* twins are dropped when a same-property token
 * exists in the same class list (per gray-sweep.mjs). EOLs preserved.
 *
 * Usage: node scripts/tokenless-sweep.mjs [--dry] [--no-twin]
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DRY = process.argv.includes('--dry');
const NO_TWIN = process.argv.includes('--no-twin');
const ROOTS = [
  join(process.cwd(), 'apps', 'web', 'src'),
  join(process.cwd(), 'packages', 'ui', 'src'),
];
const EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mdx']);

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (EXT.has(p.slice(p.lastIndexOf('.')))) out.push(p);
  }
  return out;
}

// (variant:)* mapping — exact-match tokens only
const MAP = [
  ['bg-white', 'bg-surface-elevated'],
  ['bg-gray-50', 'bg-surface'],
  ['bg-gray-100', 'bg-surface-muted'],
  ['text-gray-900', 'text-text-primary'],
  ['text-gray-500', 'text-text-secondary'],
  ['text-gray-400', 'text-text-tertiary'],
  ['border-gray-200', 'border-edge'],
  ['border-gray-100', 'border-edge-muted'],
];
const MAP_RE = new RegExp(
  `((?:(?!dark:)[a-z]+:)*)(?<!dark:)(${MAP.map(([k]) => k.replace('-', '\\-')).join('|')})(?=/|\\s|$|'|")`,
  'g',
);

const TOKEN_RE = {
  text: /(?:^|\s)text-text(?:-\w+)?(?:\/\d+)?(?:\s|$)/,
  bg: /(?:^|\s)bg-surface(?:-\w+)?(?:\/\d+)?(?:\s|$)/,
  border: /(?:^|\s)border-edge(?:-\w+)?(?:\/\d+)?(?:\s|$)/,
};
const TWIN_RE = /^dark:(text|bg|border)-gray-\d+(?:\/\d+)?$/;

function sweepClassList(str) {
  const parts = str.split(/\s+/).filter(Boolean);
  let changed = false;
  const kept = parts.filter((tok) => {
    const m = TWIN_RE.exec(tok);
    if (!m) return true;
    if (!TOKEN_RE[m[1]].test(str)) return true;
    changed = true;
    return false;
  });
  if (!changed) return str;
  const lead = /^\s*/.exec(str)[0];
  const trail = /\s*$/.exec(str)[0];
  return lead + kept.join(' ') + trail;
}

function mapClassList(str) {
  let out = '';
  let last = 0;
  MAP_RE.lastIndex = 0;
  let m;
  while ((m = MAP_RE.exec(str))) {
    const key = m[2];
    const rep = MAP.find(([k]) => k === key)?.[1];
    out += str.slice(last, m.index) + m[1] + rep;
    last = m.index + m[1].length + m[2].length;
  }
  out += str.slice(last);
  return out;
}

const QUOTE_RE = /"([^"\n]*)"|'([^'\n]*)'/g;
const TICK_RE = /`([^`\n]*)`/g;
const EXPR_RE = /\$\{[^}]*\}/g;

function applyEdits(line, edits) {
  for (let k = edits.length - 1; k >= 0; k--) {
    const e = edits[k];
    line = line.slice(0, e.start) + e.text + line.slice(e.end);
  }
  return line;
}

function sweepLine(line) {
  // pass 1 — quoted strings: map, then drop twins
  const edits = [];
  let m;
  QUOTE_RE.lastIndex = 0;
  while ((m = QUOTE_RE.exec(line))) {
    const inner = m[0].slice(1, -1);
    if (!/\s/.test(inner)) continue;
    let swept = mapClassList(inner);
    if (!NO_TWIN) swept = sweepClassList(swept);
    if (swept !== inner) {
      edits.push({
        start: m.index,
        end: m.index + m[0].length,
        text: m[0][0] + swept + m[0][m[0].length - 1],
      });
    }
  }
  line = applyEdits(line, edits);

  // pass 2 — bare backtick segments
  const edits2 = [];
  TICK_RE.lastIndex = 0;
  while ((m = TICK_RE.exec(line))) {
    const content = m[0].slice(1, -1);
    if (!content.includes('${')) continue;
    let rebuilt = '';
    let pos = 0;
    let changed = false;
    EXPR_RE.lastIndex = 0;
    let em;
    while ((em = EXPR_RE.exec(content))) {
      const bare = content.slice(pos, em.index);
      let swept = /\s/.test(bare) ? mapClassList(bare) : bare;
      if (!NO_TWIN) swept = sweepClassList(swept);
      if (swept !== bare) changed = true;
      rebuilt += swept + em[0];
      pos = em.index + em[0].length;
    }
    const tail = content.slice(pos);
    let sweptTail = /\s/.test(tail) ? mapClassList(tail) : tail;
    if (!NO_TWIN) sweptTail = sweepClassList(sweptTail);
    if (sweptTail !== tail) changed = true;
    rebuilt += sweptTail;
    if (changed) {
      edits2.push({ start: m.index, end: m.index + m[0].length, text: '`' + rebuilt + '`' });
    }
  }
  return applyEdits(line, edits2);
}

let totalFiles = 0;
let totalRemoved = 0;
for (const root of ROOTS) {
  for (const file of walk(root)) {
    const src = readFileSync(file, 'utf8');
    const eol = src.includes('\r\n') ? '\r\n' : '\n';
    const lines = src.split(/\r?\n/);
    let removed = 0;
    for (let i = 0; i < lines.length; i++) {
      const swept = sweepLine(lines[i]);
      if (swept !== lines[i]) {
        lines[i] = swept;
        removed++;
      }
    }
    if (removed > 0) {
      totalFiles++;
      totalRemoved += removed;
      if (!DRY) writeFileSync(file, lines.join(eol));
      console.log(`${removed}\t${file.replace(process.cwd() + '\\', '')}`);
    }
  }
}
console.log(
  `\nfiles changed: ${totalFiles}, lines changed: ${totalRemoved}${DRY ? ' (DRY RUN)' : ''}`,
);
