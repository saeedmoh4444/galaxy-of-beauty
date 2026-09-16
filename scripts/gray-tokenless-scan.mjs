// Bucket tokenless gray pairs for the follow-up mapping sweep.
// Usage: node scripts/gray-tokenless-scan.mjs
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOTS = ['apps/web/src', 'packages/ui/src'];
function walk(d, o = []) {
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, o);
    else if (/\.(ts|tsx|js|jsx)$/.test(p)) o.push(p);
  }
  return o;
}

// same-property pairs: light class + dark class, adjacent-ish on one line
const pairs = new Map(); // 'text-gray-700 + dark:text-gray-300' -> count
const whites = new Map(); // 'bg-white + dark:bg-gray-800' -> count
const darkOnlyText = new Map(); // 'dark:text-gray-100' (no light text class on line) -> count
const files = [...walk(ROOTS[0]), ...walk(ROOTS[1])];

const PROP = '(?:text|bg|border|ring|divide|placeholder)';
const grayCls = `${PROP}-gray-\\d+(?:/\\d+)?`;
const pairRe = new RegExp(`(?:^|[\\s"'\\x60{])(${grayCls})\\s+dark:(${grayCls})`, 'g');
const whitePairRe = new RegExp(
  `(?:^|[\\s"'\\x60{])((?:text|bg|border)-white(?:/\\d+)?)\\s+dark:((?:text|bg|border)-gray-\\d+(?:/\\d+)?)`,
  'g',
);
const darkOnlyRe = /dark:(text|bg|border)-gray-\d+(?:\/\d+)?/g;

for (const f of files) {
  const src = readFileSync(f, 'utf8');
  let m;
  pairRe.lastIndex = 0;
  while ((m = pairRe.exec(src))) {
    if (m[1].split('-')[0] !== m[2].split('-')[0]) continue; // same property
    const key = `${m[1]} + ${m[2]}`;
    pairs.set(key, (pairs.get(key) ?? 0) + 1);
  }
  whitePairRe.lastIndex = 0;
  while ((m = whitePairRe.exec(src))) {
    const key = `${m[1]} + ${m[2]}`;
    whites.set(key, (whites.get(key) ?? 0) + 1);
  }
  const lines = src.split(/\r?\n/);
  for (const ln of lines) {
    const dms = [...ln.matchAll(darkOnlyRe)].map((x) => x[0]);
    for (const d of dms) {
      const prop = d.split(':')[1].split('-')[0];
      const light = new RegExp(`(?:^|\\s)${prop}-gray-\\d+`);
      if (!light.test(ln) && !/text-text|bg-surface|border-edge/.test(ln)) {
        darkOnlyText.set(d, (darkOnlyText.get(d) ?? 0) + 1);
      }
    }
  }
}

const sortMap = (m, n) =>
  [...m.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k, v]) => `${v}\t${k}`);

console.log('== tokenless gray+dark same-prop pairs ==');
console.log(sortMap(pairs, 30).join('\n'));
console.log('\n== white + dark-gray pairs ==');
console.log(sortMap(whites, 30).join('\n'));
console.log('\n== dark-only gray (no light gray, no token) ==');
console.log(sortMap(darkOnlyText, 30).join('\n'));
