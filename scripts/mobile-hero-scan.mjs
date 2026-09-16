// Inventory mobile hero-sized emoji sites (fontSize 40+) with context.
// Usage: node scripts/mobile-hero-scan.mjs
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = join(process.cwd(), 'apps', 'mobile', 'src');
function walk(d, o = []) {
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, o);
    else if (/\.tsx$/.test(p)) o.push(p);
  }
  return o;
}

const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2705}\u{2B50}\u{2764}]/u;
const sizeRe = /fontSize:\s*(\d{2,3})/;
let count = 0;
for (const f of walk(root)) {
  const lines = readFileSync(f, 'utf8').split(/\r?\n/);
  lines.forEach((ln, i) => {
    const m = sizeRe.exec(ln);
    if (m && Number(m[1]) >= 40) {
      // show the fontSize line + 2 lines above for the emoji context
      const ctx = [lines[i - 2] ?? '', lines[i - 1] ?? '', ln].map((x) => x.trim());
      if (ctx.some((x) => EMOJI.test(x))) {
        count++;
        console.log(`\n── ${f.replace(root + '\\', '')} :${i + 1} ──`);
        console.log(ctx.map((x) => x.slice(0, 110)).join('\n'));
      }
    }
  });
}
console.log(`\ntotal emoji sites at fontSize 40+: ${count}`);
