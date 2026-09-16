/**
 * Gray double-spec sweep — remove redundant `dark:<prop>-gray-*` twins that
 * follow a semantic token of the same property (token already provides the
 * dark value via CSS custom properties).
 *
 *   text-text-primary dark:text-gray-100   ->  text-text-primary
 *   bg-surface-muted dark:bg-gray-800      ->  bg-surface-muted
 *   border-edge dark:border-gray-700       ->  border-edge
 *
 * Two passes per line:
 *   1. quoted strings  ("..." / '...') — class lists inside templates
 *   2. bare backtick-template segments (outside ${...} expressions)
 * EOLs preserved per file (CRLF stays CRLF — the prettier hook is not
 * involved).
 *
 * Usage: node scripts/gray-sweep.mjs [--dry]
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DRY = process.argv.includes('--dry');
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

const TOKEN_RE = {
  text: /(?:^|\s)text-text(?:-\w+)?(?:\/\d+)?(?:\s|$)/,
  bg: /(?:^|\s)bg-surface(?:-\w+)?(?:\/\d+)?(?:\s|$)/,
  border: /(?:^|\s)border-edge(?:-\w+)?(?:\/\d+)?(?:\s|$)/,
};
const TWIN_RE = /^dark:(text|bg|border)-gray-\d+(?:\/\d+)?$/;

// Drop a `dark:<prop>-gray-*` token iff a same-property semantic token
// exists anywhere in the class list (the token already supplies the dark
// value via CSS custom properties). Returns the input unchanged (spacing
// included) when nothing is dropped.
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

const QUOTE_RE = /"([^"\n]*)"|'([^'\n]*)'/g;
const TICK_RE = /`([^`\n]*)`/g;
const EXPR_RE = /\$\{[^}]*\}/g;

// apply [start,end)->text edits last-to-first so indices stay valid
function applyEdits(line, edits) {
  for (let k = edits.length - 1; k >= 0; k--) {
    const e = edits[k];
    line = line.slice(0, e.start) + e.text + line.slice(e.end);
  }
  return line;
}

// rebuild template text properly (expressions were split away; use markers)
function sweepLineProper(line) {
  // pass 1 — quoted strings (as above)
  const edits = [];
  let m;
  QUOTE_RE.lastIndex = 0;
  while ((m = QUOTE_RE.exec(line))) {
    const inner = m[0].slice(1, -1);
    if (!/\s/.test(inner)) continue;
    const swept = sweepClassList(inner);
    if (swept !== inner) {
      edits.push({
        start: m.index,
        end: m.index + m[0].length,
        text: m[0][0] + swept + m[0][m[0].length - 1],
      });
    }
  }
  line = applyEdits(line, edits);

  // pass 2 — bare backtick segments: sweep each non-expression region
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
      const swept = /\s/.test(bare) ? sweepClassList(bare) : bare;
      if (swept !== bare) changed = true;
      rebuilt += swept + em[0];
      pos = em.index + em[0].length;
    }
    const tail = content.slice(pos);
    const sweptTail = /\s/.test(tail) ? sweepClassList(tail) : tail;
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
      const sweptLine = sweepLineProper(lines[i]);
      if (sweptLine !== lines[i]) {
        lines[i] = sweptLine;
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
