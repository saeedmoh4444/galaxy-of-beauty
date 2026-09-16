// Inventory hardcoded hero emoji spans in (public) pages.
// Usage: node scripts/hero-emoji-scan.mjs
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = join(process.cwd(), 'apps', 'web', 'src', 'app', '(public)');
function walk(d, o = []) {
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, o);
    else if (/\.tsx$/.test(p)) o.push(p);
  }
  return o;
}

// span with text-5xl/6xl/7xl containing a literal emoji (no { interpolation)
const re = /<span className="text-(5xl|6xl|7xl)[^"]*">([^<{]*?)<\/span>/;
let count = 0;
for (const f of walk(root)) {
  const lines = readFileSync(f, 'utf8').split(/\r?\n/);
  lines.forEach((ln, i) => {
    const m = re.exec(ln);
    if (m) {
      count++;
      console.log(`${f.replace(root + '\\', '')} :${i + 1}  ${ln.trim().slice(0, 130)}`);
    }
  });
}
console.log(`\ntotal hero emoji spans: ${count}`);
