import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'apps/mobile/src');

let fixed = 0;
let occurrences = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(fp);
    else if (/\.(tsx|ts)$/.test(entry.name)) {
      let content = fs.readFileSync(fp, 'utf8');
      const before = content;

      // Pattern: .map((x: any, i: number) => → .map((x, i) =>
      // Type inference from the source array handles the types.
      const matches = content.match(/\.map\(\((\w+): any,\s*(\w+): number\)\s*=>/g) || [];
      content = content.replace(
        /\.map\(\((\w+): any,\s*(\w+): number\)\s*=>/g,
        '.map(($1, $2) =>'
      );
      // Pattern: .map((x: any) => → .map((x) =>
      content = content.replace(/\.map\(\((\w+): any\)\s*=>/g, '.map(($1) =>');
      // Pattern: .map((x: any, i) => → .map((x, i) =>
      content = content.replace(/\.map\(\((\w+): any,\s*(\w+)\)\s*=>/g, '.map(($1, $2) =>');
      // Pattern: .filter((x: any) => → .filter((x) =>
      content = content.replace(/\.filter\(\((\w+): any\)\s*=>/g, '.filter(($1) =>');
      // Pattern: .find((x: any) => → .find((x) =>
      content = content.replace(/\.find\(\((\w+): any\)\s*=>/g, '.find(($1) =>');
      // Pattern: .some((x: any) => → .some((x) =>
      content = content.replace(/\.some\(\((\w+): any\)\s*=>/g, '.some(($1) =>');
      // Pattern: .reduce((acc: any, x) => → .reduce((acc, x) =>
      content = content.replace(/\.reduce\(\((\w+): any,\s*(\w+)\)\s*=>/g, '.reduce(($1, $2) =>');

      if (content !== before) {
        const count = matches.length;
        occurrences += count;
        fs.writeFileSync(fp, content, 'utf8');
        fixed++;
      }
    }
  }
}

walk(srcDir);
console.log('Files fixed: ' + fixed);
console.log('Any removed: ~' + occurrences);
