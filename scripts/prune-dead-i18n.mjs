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
 * Usage: node scripts/prune-dead-i18n.mjs [--write] [--keep-file <path>]
 *   Without --write it prints the report only.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOTS = ['apps/web/src', 'apps/mobile/src', 'packages/ui/src', 'packages/shared/src'];
const MSG_DIR = path.join('packages', 'shared', 'src', 'i18n', 'messages');
const EXTS = ['.ts', '.tsx'];

/** Recursive .ts/.tsx collection, skipping build/derived directories. */
export function collectFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules', '.next', 'dist', 'test-fixtures'].includes(e.name)) continue;
      collectFiles(p, out);
    } else if (EXTS.includes(path.extname(e.name))) {
      out.push(p);
    }
  }
  return out;
}

/**
 * Scan sources for t('key') / t("key") literals and t(`prefix...`) template
 * prefixes. Returns the key sets the dead-key predicate is built from.
 */
export function scanUsage(files) {
  const used = new Set();
  const tmplPrefixes = new Set();
  for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    for (const m of src.matchAll(/t\(['"]([a-z][a-zA-Z0-9._-]*)['"]/g)) used.add(m[1]);
    for (const m of src.matchAll(/t\(`([a-z][a-zA-Z0-9._-]*)/g)) tmplPrefixes.add(m[1]);
  }
  return { used, tmplPrefixes };
}

/**
 * Build the dead-key predicate. A key is dead when it is never used
 * literally, is not protected by the keep-file (P: lines = prefix keeps),
 * and does not start with a dynamic t(`...`) template prefix.
 */
export function makeIsDead({ used, tmplPrefixes, keepSet = new Set(), keepPrefixes = [] }) {
  return (key) =>
    !used.has(key) &&
    !keepSet.has(key) &&
    !keepPrefixes.some((p) => key.startsWith(p)) &&
    ![...tmplPrefixes].some((p) => key.startsWith(p));
}

/**
 * Brace-aware catalog prune: removes every `'key': { ... }` entry (possibly
 * multi-line) whose key the predicate marks dead. Returns the pruned source,
 * the removed keys, the total entry count, and removed byte size.
 */
export function pruneCatalog(src, isDead) {
  const lines = src.split('\n');
  const kept = [];
  const deadKeys = [];
  let total = 0;
  let removedBytes = 0;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(\s{2})'([a-z][a-zA-Z0-9._-]*)':\s*\{/);
    if (m) {
      total += 1;
      if (isDead(m[2])) {
        deadKeys.push(m[2]);
        // consume lines until the entry's value object closes
        let depth = 0;
        let j = i;
        while (j < lines.length) {
          removedBytes += lines[j].length + 1;
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
  return { src: kept.join('\n'), deadKeys, total, removedBytes };
}

/** Parse a keep-file: bare lines = exact keys, `P:` lines = prefixes. */
export function parseKeepFile(content) {
  const keepSet = new Set();
  const keepPrefixes = [];
  for (const raw of content.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('P:')) keepPrefixes.push(line.slice(2));
    else keepSet.add(line);
  }
  return { keepSet, keepPrefixes };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const files = [];
  for (const root of ROOTS) collectFiles(root, files);
  const { used, tmplPrefixes } = scanUsage(files);

  const keepIdx = process.argv.indexOf('--keep-file');
  const keepFile =
    keepIdx !== -1 && process.argv[keepIdx + 1] && fs.existsSync(process.argv[keepIdx + 1])
      ? process.argv[keepIdx + 1]
      : null;
  const { keepSet, keepPrefixes } = keepFile
    ? parseKeepFile(fs.readFileSync(keepFile, 'utf8'))
    : { keepSet: new Set(), keepPrefixes: [] };

  const isDead = makeIsDead({ used, tmplPrefixes, keepSet, keepPrefixes });

  let total = 0;
  let deadBytes = 0;
  const deadKeys = [];
  const msgFiles = collectFiles(MSG_DIR);

  for (const f of msgFiles) {
    const {
      src,
      deadKeys: fileDead,
      total: fileTotal,
      removedBytes,
    } = pruneCatalog(fs.readFileSync(f, 'utf8'), isDead);
    total += fileTotal;
    deadBytes += removedBytes;
    deadKeys.push(...fileDead);
    if (process.argv.includes('--write')) {
      fs.writeFileSync(f, src);
    }
  }

  const dead = deadKeys.length;
  console.log(`keys: ${total} total, ${dead} dead (${((dead / total) * 100).toFixed(1)}%)`);
  console.log(`estimated source bytes removed: ${(deadBytes / 1024).toFixed(0)}K`);
  console.log(`template prefixes kept: ${tmplPrefixes.size}`);
  if (!process.argv.includes('--write')) {
    console.log('\n(dry run — pass --write to prune)');
    console.log(deadKeys.slice(0, 30).join('\n'));
  }
}
