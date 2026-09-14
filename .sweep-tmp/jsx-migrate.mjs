import fs from 'fs';
import { execSync } from 'child_process';
const root = 'C:/Users/saeed/Desktop/under_working/beauty_project';
const apply = process.argv.includes('--apply');

const IMPORT_LINE = "import type { JSX } from 'react';";
const files = execSync(`git -C ${JSON.stringify(root)} ls-files`, { encoding: 'utf8' })
  .split(/\r?\n/)
  .filter((f) => /\.(ts|tsx)$/.test(f) && !/\.d\.ts$/.test(f) && !/node_modules/.test(f));

let changedFiles = 0;
let skipped = 0;
const log = [];
for (const rel of files) {
  const abs = root + '/' + rel;
  const src = fs.readFileSync(abs, 'utf8');
  // detection on comment-stripped source (avoid unused imports from comment mentions)
  const stripped = src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/[^\r\n]*/g, '$1');
  if (!/\bJSX\./.test(stripped)) continue;
  // already migrated?
  if (/import\s+type\s*\{[^}]*\bJSX\b[^}]*\}\s+from\s+'react'/.test(src)) continue;
  if (/import\s+\{([^}]*\bJSX\b[^}]*)\}\s+from\s+'react'/.test(src)) continue;
  const hasCRLF = src.includes('\r\n');
  const lines = src.split(/\r?\n/);
  // insertion point: after the last `from 'react';` import, else after 'use client', else at top
  let idx = 0;
  for (let i = 0; i < lines.length; i++) {
    if (/from\s+'react';?\s*$/.test(lines[i])) idx = i + 1;
  }
  if (idx === 0 && /^['"]use client['"];?/.test(lines[0])) idx = 1;
  lines.splice(idx, 0, IMPORT_LINE);
  const out = lines.join(hasCRLF ? '\r\n' : '\n');
  if (apply) fs.writeFileSync(abs, out);
  changedFiles++;
  log.push(rel);
}
console.log(`files=${changedFiles}${apply ? ' APPLIED' : ' (dry)'}`);
console.log(log.slice(0, 15).join('\n'));
console.log(`... total ${log.length}`);
