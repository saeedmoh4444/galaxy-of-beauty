#!/usr/bin/env node
/**
 * Mobile dead-touchable scanner (audit M8).
 *
 * Finds <TouchableOpacity> elements without an onPress prop (and without a
 * {...spread} that could carry one). A TouchableOpacity without onPress is a
 * dead affordance: it renders as tappable but does nothing.
 *
 * Usage: node scripts/find-dead-touchables.mjs [--strict] [--check]
 *   --strict  also flags elements with spread props (possible false positives)
 *   --check   CI gate mode: exit 1 when dead touchables exist
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (name.endsWith('.tsx')) out.push(p);
  }
  return out;
}

/**
 * Given source and the index just after `<TouchableOpacity`, return the index
 * of the `>` closing the opening tag (skipping `{...}` and string contents),
 * or -1 if unmatched.
 */
export function tagEnd(src, start) {
  let depth = 0;
  let inString = null;
  let inTemplate = false;
  for (let i = start; i < src.length; i++) {
    const c = src[i];
    if (inString) {
      if (inString === '"' && c === '"' && src[i - 1] !== '\\') inString = null;
      else if (inString === "'" && c === "'" && src[i - 1] !== '\\') inString = null;
      else if (inString === '`' && c === '`' && src[i - 1] !== '\\') inString = null;
      else if (inString === '`' && c === '$' && src[i + 1] === '{') {
        inTemplate = true;
        depth = 1;
        i++;
      }
      continue;
    }
    if (inTemplate) {
      if (c === '{') depth++;
      else if (c === '}') {
        depth--;
        if (depth === 0) {
          inTemplate = false;
          inString = '`';
        }
      } else if (c === '"' || c === "'") inString = c;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') {
      inString = c;
      continue;
    }
    if (c === '{') depth++;
    else if (c === '}') depth--;
    else if (c === '>' && depth === 0) return i;
  }
  return -1;
}

function lineOf(src, idx) {
  let n = 1;
  for (let i = 0; i < idx; i++) if (src[i] === '\n') n++;
  return n;
}

const findings = [];
let checked = 0;

/** Strip JS line/block comments and JSX block comments (only outside strings). */
export function stripComments(src) {
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
        out += src[i] === '\n' ? '\n' : ' '; // preserve line numbers
        i++;
      }
      i += 2;
      continue;
    }
    if (c === '{' && src[i + 1] === '/' && src[i + 2] === '*') {
      i += 3;
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) {
        out += src[i] === '\n' ? '\n' : ' '; // preserve line numbers
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

export function scan(rootDir, { strict = false, base = null } = {}) {
  const findings = [];
  let checked = 0;

  for (const file of walk(rootDir)) {
    const src = stripComments(readFileSync(file, 'utf8'));
    const re = /<TouchableOpacity\b/g;
    let m;
    while ((m = re.exec(src))) {
      checked++;
      const end = tagEnd(src, m.index + '<TouchableOpacity'.length);
      if (end === -1) continue; // unclosed tag — leave to tsc
      const tag = src.slice(m.index, end);
      const hasOnPress = /\bonPress\s*[={]/.test(tag);
      const hasSpread = /\{\.\.\./.test(tag);
      if (hasOnPress) continue;
      if (hasSpread && !strict) continue;
      findings.push({
        file: relative(base ?? rootDir, file),
        line: lineOf(src, m.index),
        spread: hasSpread,
      });
    }
  }

  findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
  return { checked, findings };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const ROOT = join(process.cwd(), 'apps/mobile/src');
  const STRICT = process.argv.includes('--strict');
  const { checked, findings } = scan(ROOT, { strict: STRICT, base: process.cwd() });

  console.log(`checked ${checked} TouchableOpacity elements across the app`);
  console.log(`dead (no onPress${STRICT ? ', incl. spread-props' : ''}): ${findings.length}\n`);
  for (const f of findings) console.log(`${f.file}:${f.line}${f.spread ? ' (spread)' : ''}`);

  // --check: CI gate mode — fail when dead touchables exist.
  if (process.argv.includes('--check') && findings.length > 0) {
    process.exitCode = 1;
  }
}
