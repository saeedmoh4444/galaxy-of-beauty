// W6-2 ui locale sweep: replace `locale = 'ar'` defaults with
// getUILocale() across the ui components. Run: node scripts/ui-locale-sweep.mjs
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'packages/ui/src/components';

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith('.tsx') || name.endsWith('.ts')) out.push(p);
  }
  return out;
}

let changed = 0;
let skipped = 0;
for (const file of walk(ROOT)) {
  let src = readFileSync(file, 'utf8');
  if (!src.includes(`locale = 'ar'`) && !src.includes(`locale = "ar"`)) {
    skipped++;
    continue;
  }
  if (src.includes('getUILocale')) {
    skipped++;
    continue;
  }
  // Import: every file sits somewhere under components/, so the relative
  // depth varies — compute it from the file's location.
  const depth = file.split(/[\\/]/).length - ROOT.split(/[\\/]/).length - 1;
  const rel = depth <= 0 ? '../locale' : '../'.repeat(depth + 1) + 'locale';
  src = src
    .replace(/locale = 'ar'/g, 'locale = getUILocale()')
    .replace(/locale = "ar"/g, 'locale = getUILocale()');

  // Insert the import after the last existing import line (or after the
  // 'use client' directive if the file has no imports yet).
  const lines = src.split('\n');
  let insertAt = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^import\s/.test(lines[i]) || /^import\s*\{/.test(lines[i])) insertAt = i;
  }
  const importLine = `import { getUILocale } from '${rel}';`;
  if (insertAt >= 0) {
    lines.splice(insertAt + 1, 0, importLine);
  } else {
    const useClientIdx = lines.findIndex((l) => /^['"]use client['"]/.test(l));
    lines.splice(useClientIdx >= 0 ? useClientIdx + 1 : 0, 0, importLine);
  }
  writeFileSync(file, lines.join('\n'));
  changed++;
  console.log(`swept ${file}`);
}
console.log(`\nchanged: ${changed}, skipped: ${skipped}`);
