#!/usr/bin/env node
/**
 * Prune dead i18n keys (bundle slimming, 5.4).
 *
 * Removes catalog entries whose key never appears in a literal t('...') /
 * t("...") call in apps/web, apps/mobile, packages/ui or packages/shared
 * (including __tests__), and does not match a dynamic t(`prefix.${...}`)
 * template prefix.
 *
 * Removal is brace-depth-aware: entries may span multiple lines
 * (prettier wraps long Arabic strings), so each `'key': {` is removed
 * together with its full `{ ar, en }` value object.
 *
 * Safety net: t() is typed against TranslationKey — deleting a key that is
 * actually used anywhere breaks type-check, which reveals the mistake.
 *
 * Usage: node scripts/prune-dead-i18n.mjs [--write]
 *   Without --write it prints the report only.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOTS = ['apps/web/src', 'apps/mobile/src', 'packages/ui/src', 'packages/shared/src'];
const MSG_DIR = path.join('packages', 'shared', 'src', 'i18n', 'messages');
const EXTS = ['.ts', '.tsx'];

function collectFiles(dir, out) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules', '.next', 'dist', 'test-fixtures'].includes(e.name)) continue;
      collectFiles(p, out);
    } else if (EXTS.includes(path.extname(e.name))) {
      out.push(p);
    }
  }
}

const files = [];
for (const root of ROOTS) collectFiles(root, files);

const used = new Set();
const tmplPrefixes = new Set();
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  for (const m of src.matchAll(/t\(['"]([a-z][a-zA-Z0-9._-]*)['"]/g)) used.add(m[1]);
  for (const m of src.matchAll(/t\(`([a-z][a-zA-Z0-9._-]*)/g)) tmplPrefixes.add(m[1]);
}

const isDead = (key) =>
  !used.has(key) &&
  !keepSet.has(key) &&
  !keepPrefixes.some((p) => key.startsWith(p)) &&
  ![...tmplPrefixes].some((p) => key.startsWith(p));

// Optional keep-file: keys to preserve (fed by the type-check feedback loop).
// Lines starting with "P:" match any key starting with that prefix (used for
// numeric key families that TS truncates in union errors, e.g. fortune-1..12).
const keepSet = new Set();
const keepPrefixes = [];
const keepIdx = process.argv.indexOf('--keep-file');
if (keepIdx !== -1 && process.argv[keepIdx + 1] && fs.existsSync(process.argv[keepIdx + 1])) {
  for (const k of fs.readFileSync(process.argv[keepIdx + 1], 'utf8').split('\n')) {
    const line = k.trim();
    if (!line) continue;
    if (line.startsWith('P:')) keepPrefixes.push(line.slice(2));
    else keepSet.add(line);
  }
}

let total = 0;
let dead = 0;
let deadBytes = 0;
const deadKeys = [];
const msgFiles = [];
collectFiles(MSG_DIR, msgFiles);

for (const f of msgFiles) {
  const src = fs.readFileSync(f, 'utf8');
  const lines = src.split('\n');
  const kept = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(\s{2})'([a-z][a-zA-Z0-9._-]*)':\s*\{/);
    if (m) {
      total += 1;
      if (isDead(m[2])) {
        dead += 1;
        deadKeys.push(m[2]);
        // remove the entry: consume lines until its value object closes
        let depth = 0;
        let j = i;
        while (j < lines.length) {
          deadBytes += lines[j].length + 1;
          for (const ch of lines[j]) {
            if (ch === '{') depth += 1;
            else if (ch === '}') depth -= 1;
          }
          j += 1;
          if (depth <= 0) break;
        }
        i = j - 1;
        continue;
      }
    }
    kept.push(lines[i]);
  }
  if (process.argv.includes('--write')) {
    fs.writeFileSync(f, kept.join('\n'));
  }
}

console.log(`keys: ${total} total, ${dead} dead (${((dead / total) * 100).toFixed(1)}%)`);
console.log(`estimated source bytes removed: ${(deadBytes / 1024).toFixed(0)}K`);
console.log(`template prefixes kept: ${tmplPrefixes.size}`);
if (!process.argv.includes('--write')) {
  console.log('\n(dry run — pass --write to prune)');
  console.log(deadKeys.slice(0, 30).join('\n'));
}
