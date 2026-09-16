/**
 * Dark-only sweep — class lists whose ONLY bg/border color is a `dark:`
 * twin (inputs etc. with no light-side class):
 *   dark:bg-gray-800        -> bg-surface-elevated        (explicit white in
 *                                                          light = default)
 *   border dark:border-gray-700 -> border border-edge
 *
 * Conditions (per class list):
 *   bg:     twin present AND no other `(variant:)*bg-` class
 *   border: twin present AND a bare border-width token (border, border-t…)
 *           AND no border color class (border-edge/brand/…)
 * EOLs preserved.
 *
 * Usage: node scripts/dark-only-sweep.mjs [--dry]
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

const BG_TWIN = /^dark:bg-gray-\d+(?:\/(\d+))?$/;
const BORDER_TWIN = /^dark:border-gray-\d+(?:\/(\d+))?$/;
const HAS_BG = /(?:^|\s)(?:(?!dark:)[a-z]+:)*bg-/;
const HAS_BORDER_WIDTH = /(?:^|\s)border(?:-[trblxysew]+)?(?:\s|$)/;
const HAS_BORDER_COLOR =
  /(?:^|\s)border-(?:edge|brand|accent|success|warning|danger|info|green|red|amber|rose|cyan|blue|emerald|purple|pink|white|black)/;

function sweepClassList(str) {
  const parts = str.split(/\s+/).filter(Boolean);
  let changed = false;
  const out = parts.map((tok) => {
    const bgM = BG_TWIN.exec(tok);
    if (bgM && !HAS_BG.test(str)) {
      changed = true;
      return bgM[1] ? `bg-surface-elevated/${bgM[1]}` : 'bg-surface-elevated';
    }
    const bM = BORDER_TWIN.exec(tok);
    if (bM && HAS_BORDER_WIDTH.test(str) && !HAS_BORDER_COLOR.test(str)) {
      changed = true;
      return bM[1] ? `border-edge/${bM[1]}` : 'border-edge';
    }
    return tok;
  });
  if (!changed) return str;
  const lead = /^\s*/.exec(str)[0];
  const trail = /\s*$/.exec(str)[0];
  return lead + out.join(' ') + trail;
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
