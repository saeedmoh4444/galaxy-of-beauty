// Context around each hardcoded hero emoji span.
// Usage: node scripts/hero-emoji-context.mjs [file-pattern]
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = join(process.cwd(), 'apps', 'web', 'src', 'app', '(public)');
const filter = process.argv[2];
function walk(d, o = []) {
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, o);
    else if (/\.tsx$/.test(p) && (!filter || p.includes(filter))) o.push(p);
  }
  return o;
}

const re = /<span className="text-(5xl|6xl|7xl)[^"]*">([^<{]*?)<\/span>/;
for (const f of walk(root)) {
  const lines = readFileSync(f, 'utf8').split(/\r?\n/);
  lines.forEach((ln, i) => {
    const m = re.exec(ln);
    if (m) {
      console.log(`\n── ${f.replace(root + '\\', '')} :${i + 1} ──`);
      for (let k = Math.max(0, i - 5); k <= Math.min(lines.length - 1, i + 2); k++) {
        console.log(`${String(k + 1).padStart(4)}  ${lines[k].trim().slice(0, 110)}`);
      }
    }
  });
}
