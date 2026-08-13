import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'apps/mobile/src');

const results = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(fp);
    else if (/\.(tsx|ts)$/.test(entry.name)) {
      const content = fs.readFileSync(fp, 'utf8');
      const count = (content.match(/: any|as any|<any>/g) || []).length;
      if (count > 0) {
        results.push({ file: path.relative(srcDir, fp), count });
      }
    }
  }
}

walk(srcDir);
results.sort((a, b) => b.count - a.count);

let total = 0;
for (const r of results) total += r.count;

console.log('Total any: ' + total + ' across ' + results.length + ' files\n');
console.log('=== Top 40 files by any count ===');
for (const r of results.slice(0, 40)) {
  console.log(r.count.toString().padStart(4) + '  ' + r.file);
}

// Save full list
fs.writeFileSync(path.join(root, 'scripts', 'any-audit.json'), JSON.stringify(results, null, 2));
