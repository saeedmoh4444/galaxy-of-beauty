// List remaining same-property token + dark-gray-twin lines (post-sweep residue).
// Usage: node scripts/gray-residue.mjs
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

const sameProp = /dark:(text|bg|border)-gray-\d+(?:\/\d+)?/g;
let count = 0;
for (const f of [...walk(ROOTS[0]), ...walk(ROOTS[1])]) {
  const src = readFileSync(f, 'utf8');
  const lines = src.split(/\r?\n/);
  lines.forEach((ln, i) => {
    const dms = [...ln.matchAll(sameProp)].map((x) => x[0]);
    for (const d of dms) {
      const prop = d.split(':')[1].split('-')[0];
      const tok = prop === 'text' ? /text-text/ : prop === 'bg' ? /bg-surface/ : /border-edge/;
      if (tok.test(ln)) {
        count++;
        console.log(`${f}:${i + 1}  ${ln.trim().slice(0, 180)}`);
      }
    }
  });
}
console.log(`\nresidue lines: ${count}`);
