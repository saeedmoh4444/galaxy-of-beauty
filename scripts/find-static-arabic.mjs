#!/usr/bin/env node
/**
 * Mobile static-Arabic scanner (audit mobile gap: 65 screens / ~2,300 lines
 * of hardcoded Arabic ignore the locale toggle).
 *
 * Flags lines in apps/mobile/src .tsx files that contain Arabic characters
 * OUTSIDE t('...') / t("...") key arguments and outside comments. Files
 * listed in scripts/static-arabic-allowlist.txt are exempt — the sweep
 * migrates screens slice by slice and removes them from the list.
 *
 * Usage: node scripts/find-static-arabic.mjs [--check] [--web] [--files]
 *   --web     scan apps/web/src with static-arabic-web-allowlist.txt (F4)
 *   --check   CI gate mode: exit 1 when findings exist outside the allowlist
 *   --files   print only the file list (allowlist seeding)
 * The CI gate runs through find-static-arabic.test.mjs (node --test
 * scripts/*.test.mjs in the Architecture Gates job).
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

const ARABIC = /[\u0600-\u06FF]/;
const MOBILE_ROOT = join(process.cwd(), 'apps/mobile/src');
const MOBILE_ALLOWLIST = join(process.cwd(), 'scripts/static-arabic-allowlist.txt');
// F4 — the same gate for the web app (ratcheted via its own allowlist).
const WEB_ROOT = join(process.cwd(), 'apps/web/src');
const WEB_ALLOWLIST = join(process.cwd(), 'scripts/static-arabic-web-allowlist.txt');

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith('.tsx')) out.push(p);
  }
  return out;
}

/** Strip JS line/block comments and JSX block comments (outside strings). */
function stripComments(src) {
  let out = '';
  let i = 0;
  let inString = null;
  while (i < src.length) {
    const c = src[i];
    if (inString) {
      out += c;
      if (c === inString && src[i - 1] !== '\\') inString = null;
      i++;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') {
      inString = c;
      out += c;
      i++;
      continue;
    }
    if (c === '/' && src[i + 1] === '/') {
      while (i < src.length && src[i] !== '\n') i++;
      continue;
    }
    if (c === '/' && src[i + 1] === '*') {
      i += 2;
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) {
        out += src[i] === '\n' ? '\n' : ' ';
        i++;
      }
      i += 2;
      continue;
    }
    if (c === '{' && src[i + 1] === '/' && src[i + 2] === '*') {
      i += 3;
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) {
        out += src[i] === '\n' ? '\n' : ' ';
        i++;
      }
      i += 2;
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

/**
 * Spans of t('...') / t("...") key arguments on one line. Arabic inside
 * these is a catalog key, not user-facing text.
 */
function tKeySpans(line) {
  const spans = [];
  for (const m of line.matchAll(/\bt\(\s*(['"])([^'"\n]*)\1\s*[),]/g)) {
    spans.push([m.index, m.index + m[0].length]);
  }
  return spans;
}

function inSpan(idx, spans) {
  return spans.some(([s, e]) => idx >= s && idx < e);
}

export function scan(dir = MOBILE_ROOT, allowlistPath = MOBILE_ALLOWLIST) {
  const allow = existsSync(allowlistPath)
    ? new Set(
        readFileSync(allowlistPath, 'utf8')
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean),
      )
    : new Set();
  const findings = [];
  for (const file of walk(dir)) {
    const rel = relative(process.cwd(), file).split('\\').join('/');
    if (allow.has(rel)) continue;
    const src = stripComments(readFileSync(file, 'utf8'));
    const lines = src.split('\n');
    lines.forEach((line, i) => {
      if (!ARABIC.test(line)) return;
      const spans = tKeySpans(line);
      for (const m of line.matchAll(new RegExp(ARABIC.source, 'g'))) {
        if (!inSpan(m.index, spans)) {
          findings.push({ file: rel, line: i + 1 });
          return;
        }
      }
    });
  }
  findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
  return { findings };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const web = process.argv.includes('--web');
  const { findings } = scan(web ? WEB_ROOT : MOBILE_ROOT, web ? WEB_ALLOWLIST : MOBILE_ALLOWLIST);
  const files = [...new Set(findings.map((f) => f.file))];
  if (process.argv.includes('--files')) {
    for (const f of files) console.log(f);
  } else {
    console.log(
      `static Arabic lines outside t()/comments: ${findings.length} across ${files.length} files\n`,
    );
    for (const f of findings.slice(0, 40)) console.log(`${f.file}:${f.line}`);
    if (findings.length > 40) console.log(`… and ${findings.length - 40} more`);
  }
  if (process.argv.includes('--check') && findings.length > 0) process.exitCode = 1;
}
