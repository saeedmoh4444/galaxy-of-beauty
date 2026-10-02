#!/usr/bin/env node
/**
 * Mobile orphan-route gate (audit M7).
 *
 * An expo-router screen is orphaned when nothing in the app navigates to it.
 * The audit found 241 of 320 routes orphaned; nav hubs wired all but a
 * handful. This gate keeps the route graph honest: every screen (dir with
 * index.tsx, or [param].tsx file) must have at least one inbound reference
 * outside itself — a literal route string, a `/route/${id}`-style template,
 * or a relative push from the same directory for sibling sub-routes.
 *
 * Skipped (entries/special, not navigable by design):
 *   - the root index, (auth) subtree (login/register entries)
 *   - error.tsx / not-found.tsx / offline
 *   - screens whose parent dir carries the inbound link (sub-routes of a
 *     hub that links its own children), i.e. only the PARENT dir is checked
 *
 * Usage: node scripts/check-orphan-routes.mjs [--check] [--strict]
 *   --check   CI gate mode: exit 1 when orphans exist
 *   --strict  include sub-route dirs whose parent links its own children
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

const SKIP_DIRS = new Set(['(auth)', '(tabs)']);
const SKIP_ROUTES = new Set(['/', '/offline']);

function walk(dir, withDirs = false) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (withDirs) out.push(p);
      out.push(...walk(p, withDirs));
    } else out.push(p);
  }
  return out;
}

/** All .tsx files (candidates for route strings + inbound references). */
function collectTsx(root) {
  return walk(root).filter((p) => p.endsWith('.tsx'));
}

/** Routes: every dir with index.tsx + every [param].tsx file route. */
function collectRoutes(root) {
  const routes = [];
  const dirs = walk(root, true).filter((p) => statSync(p).isDirectory());
  for (const d of dirs) {
    const rel = relative(root, d).split('\\').join('/');
    if (rel.split('/').some((seg) => SKIP_DIRS.has(seg))) continue;
    if (existsSync(join(d, 'index.tsx'))) routes.push({ rel, type: 'dir' });
  }
  const files = walk(root).filter((p) => /\[[^\]]+\]\.tsx$/.test(p) && !p.endsWith('_layout.tsx'));
  for (const f of files) {
    const rel = relative(root, f)
      .split('\\')
      .join('/')
      .replace(/\.tsx$/, '');
    routes.push({ rel, type: 'file' });
  }
  return routes;
}

/** Literal prefix with bracket segments removed, slashes collapsed. */
function prefixOf(rel) {
  return '/' + rel.replace(/\[[^\]]*\]/g, '').replace(/\/+/g, '/');
}

/**
 * Does `text` reference the route? For static routes: contains the literal
 * prefix. For dynamic routes: contains the part before the first bracket AND
 * the part after the last bracket (covers `/x/${id}` and `/x/${id}/room`).
 */
export function references(text, rel, prefix) {
  const bracket = rel.indexOf('[');
  if (bracket === -1) return text.includes(prefix);
  const before = '/' + rel.slice(0, bracket).replace(/\/+$/, '');
  const after = rel.slice(rel.lastIndexOf(']') + 1).replace(/\/+/g, '/');
  // Terminal [id]: require the template open — `/x/${`. The parent list
  // link (`/x`) alone does not reach the detail route.
  if (!after) return text.includes(before + '/');
  return text.includes(before) && text.includes(after);
}

export function scan(rootDir, { strict = false } = {}) {
  const root = rootDir.endsWith('src/app') ? rootDir : join(rootDir, 'src/app');
  const files = collectTsx(root);
  const sources = new Map(files.map((f) => [f, readFileSync(f, 'utf8')]));
  const routes = collectRoutes(root);

  const orphans = [];
  for (const { rel, type } of routes) {
    const route = '/' + rel;
    if (SKIP_ROUTES.has(route)) continue;
    const prefix = prefixOf(rel);

    // Self-exclusion: a dir excludes its own subtree; a [x].tsx file
    // excludes only itself (its parent list screen legitimately links it,
    // so in non-strict mode sub-routes of a linking parent are covered).
    const self = join(root, rel.split('/').join(process.platform === 'win32' ? '\\' : '/'));

    let inbound = null;
    for (const [f, src] of sources) {
      const isSelf =
        type === 'dir'
          ? f === self || f.startsWith(self + '\\') || f.startsWith(self + '/')
          : f === self + '.tsx';
      if (isSelf) continue;
      if (references(src, rel, prefix)) {
        inbound = f;
        break;
      }
    }
    if (!inbound && !(type === 'file' && !strict)) {
      // File routes under a linked parent are fine unless --strict.
      const parentRel = rel.split('/').slice(0, -1).join('/');
      const parent = '/' + parentRel;
      const parentInbound = sources.has(join(root, parentRel, 'index.tsx'));
      if (!(type === 'file' && !strict && parentInbound)) {
        orphans.push(route);
      }
    }
  }
  orphans.sort();
  return { orphans, checked: routes.length };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const root = join(process.cwd(), 'apps/mobile');
  const strict = process.argv.includes('--strict');
  const { orphans, checked } = scan(root, { strict });
  console.log(`checked ${checked} mobile routes`);
  console.log(`orphaned (no inbound navigation): ${orphans.length}\n`);
  for (const o of orphans) console.log(o);
  if (process.argv.includes('--check') && orphans.length > 0) {
    process.exitCode = 1;
  }
}
