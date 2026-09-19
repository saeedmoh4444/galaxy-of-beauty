#!/usr/bin/env node
/**
 * Architecture gate — ARCH-003 enforcement + circular dependency detection.
 *
 * Part A: fails when a package declares a forbidden `workspace:` dependency
 *   (shared→ui, api→ui, db→api, shared→api — see docs/architecture/context-map.md).
 * Part B: builds the static file-import graph of every workspace package and
 *   fails on circular imports (Tarjan SCC, size ≥ 2) and self-imports.
 *
 * Conventions (documented here because the gate depends on them):
 * - `import type` / `export type` edges are erased at runtime → ignored.
 * - Dynamic `import()` / `require()` edges are the sanctioned cycle-break
 *   pattern (used in packages/api/src/workers/handlers.ts) → ignored.
 * - `@galaxy/*` specifiers resolve through each package's `exports` map and
 *   tsconfig `paths` aliases (e.g. `@/*`); unresolvable specifiers are skipped
 *   and counted in the summary.
 *
 * Usage: node scripts/check-cycles.mjs [workspaceRoot]
 * Exits 1 with a violation list, mirrors scripts/audit-check.mjs conventions.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const EXTS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];

/** ARCH-003 forbidden dependency edges (from docs/architecture/context-map.md). */
export const FORBIDDEN_PAIRS = [
  ['@galaxy/shared', '@galaxy/ui'],
  ['@galaxy/api', '@galaxy/ui'],
  ['@galaxy/db', '@galaxy/api'],
  ['@galaxy/shared', '@galaxy/api'],
];

const DYNAMIC_RE = /(?:import|require)\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
const STATIC_RE =
  /(?:^|[\n;])\s*(?:import|export)\s+(?!type\b)([\s\S]*?)\s+from\s*['"]([^'"]+)['"]/g;
const SIDE_EFFECT_RE = /(?:^|[\n;])\s*import\s+(?!type\b)['"]([^'"]+)['"]/g;

/** Parse a source file into static (runtime) and dynamic (masked) specifiers. */
export function parseImports(content) {
  const dynamic = new Set();
  let m;
  while ((m = DYNAMIC_RE.exec(content))) dynamic.add(m[1]);

  // Mask dynamic imports and strip comments so they cannot produce static edges.
  const masked = content
    .replaceAll(/(?:import|require)\s*\(\s*['"][^'"]*['"]\s*\)/g, '')
    .replaceAll(/\/\/[^\n]*/g, '')
    .replaceAll(/\/\*[\s\S]*?\*\//g, '');

  const staticSet = new Set();
  while ((m = STATIC_RE.exec(masked))) staticSet.add(m[2]);
  while ((m = SIDE_EFFECT_RE.exec(masked))) staticSet.add(m[1]);

  return { static: staticSet, dynamic };
}

/** Expand a pnpm-workspace glob with a single `*` segment into package dirs. */
function expandGlob(rootDir, pattern) {
  const norm = pattern.replaceAll('\\', '/');
  const starIdx = norm.indexOf('*');
  if (norm.indexOf('*', starIdx + 1) !== -1) {
    throw new Error(`unsupported workspace glob: ${pattern}`);
  }
  if (starIdx === -1) {
    const abs = path.resolve(rootDir, norm);
    return fs.existsSync(abs) ? [abs] : [];
  }
  const suffix = norm.slice(starIdx + 1);
  if (suffix.includes('/')) throw new Error(`unsupported workspace glob: ${pattern}`);
  const base = path.resolve(rootDir, norm.slice(0, starIdx) || '.');
  if (!fs.existsSync(base)) return [];
  const out = [];
  for (const entry of fs.readdirSync(base, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const abs = path.join(base, entry.name);
    if (fs.existsSync(path.join(abs, 'package.json'))) out.push(abs);
  }
  return out;
}

function resolveExtends(spec, pkgRoot, workspaceRoot) {
  const candidate = spec.startsWith('.')
    ? path.resolve(pkgRoot, spec)
    : path.join(workspaceRoot, 'node_modules', spec);
  if (!fs.existsSync(candidate)) return null;
  try {
    return JSON.parse(fs.readFileSync(candidate, 'utf8'));
  } catch {
    return null;
  }
}

/** tsconfig `paths` of a package, merged with its `extends` chain (own wins). */
function loadTsconfigPaths(pkgRoot, workspaceRoot) {
  const merged = {};
  const ownPath = path.join(pkgRoot, 'tsconfig.json');
  if (!fs.existsSync(ownPath)) return merged;
  let own = null;
  try {
    own = JSON.parse(fs.readFileSync(ownPath, 'utf8'));
  } catch {
    own = null;
  }
  if (own && typeof own.extends === 'string') {
    const base = resolveExtends(own.extends, pkgRoot, workspaceRoot);
    if (base) Object.assign(merged, base.compilerOptions?.paths ?? {});
  }
  Object.assign(merged, own?.compilerOptions?.paths ?? {});
  return merged;
}

/**
 * Load the workspace: registry (name → package info), package list, and the
 * directories to scan for source files (src/ plus prisma/ where present).
 */
export function loadWorkspace(rootDir) {
  const yamlPath = path.join(rootDir, 'pnpm-workspace.yaml');
  if (!fs.existsSync(yamlPath)) throw new Error(`no pnpm-workspace.yaml in ${rootDir}`);
  const patterns = [];
  for (const line of fs.readFileSync(yamlPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*-\s*["']([^"']+)["']\s*$/);
    if (m) patterns.push(m[1]);
  }

  const pkgDirs = new Set();
  for (const pattern of patterns) for (const dir of expandGlob(rootDir, pattern)) pkgDirs.add(dir);

  const registry = new Map();
  const packages = [];
  for (const dir of [...pkgDirs].sort()) {
    const manifestPath = path.join(dir, 'package.json');
    if (!fs.existsSync(manifestPath)) continue;
    let manifest;
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch {
      continue;
    }
    if (!manifest.name) continue;
    const pkg = {
      name: manifest.name,
      root: dir,
      exports: manifest.exports ?? null,
      main: manifest.main ?? null,
      workspaceDeps: new Map(),
      tsconfigPaths: loadTsconfigPaths(dir, rootDir),
    };
    for (const section of ['dependencies', 'devDependencies', 'peerDependencies']) {
      for (const [dep, version] of Object.entries(manifest[section] ?? {})) {
        if (typeof version === 'string' && version.startsWith('workspace:')) {
          pkg.workspaceDeps.set(dep, section);
        }
      }
    }
    registry.set(pkg.name, pkg);
    packages.push(pkg);
  }

  const roots = [];
  for (const pkg of packages) {
    for (const sub of ['src', 'prisma']) {
      const dir = path.join(pkg.root, sub);
      if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) roots.push(dir);
    }
  }
  return { registry, packages, roots, rootDir };
}

function collectFiles(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (['node_modules', '.next', '.expo', 'dist', 'coverage'].includes(entry.name)) continue;
      collectFiles(path.join(dir, entry.name), out);
    } else if (EXTS.some((e) => entry.name.endsWith(e))) {
      out.push(path.join(dir, entry.name));
    }
  }
}

function findOwnerPackage(file, packages) {
  let best = null;
  for (const pkg of packages) {
    const rel = path.relative(pkg.root, file);
    if (rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel))) {
      if (!best || pkg.root.length > best.root.length) best = pkg;
    }
  }
  return best;
}

function unpackExportTarget(value) {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    for (const v of value) {
      const t = unpackExportTarget(v);
      if (t) return t;
    }
    return null;
  }
  if (value && typeof value === 'object') {
    for (const key of ['import', 'default', 'node', 'require', 'browser', 'types']) {
      const t = unpackExportTarget(value[key]);
      if (t) return t;
    }
  }
  return null;
}

function resolveExports(exportsMap, subpath) {
  if (!exportsMap || typeof exportsMap !== 'object') return null;
  if (Array.isArray(exportsMap)) {
    for (const entry of exportsMap) {
      const t = unpackExportTarget(entry);
      if (t) return t;
    }
    return null;
  }
  if (Object.prototype.hasOwnProperty.call(exportsMap, subpath)) {
    return unpackExportTarget(exportsMap[subpath]);
  }
  for (const [key, value] of Object.entries(exportsMap)) {
    if (!key.endsWith('*')) continue;
    const prefix = key.slice(0, -1);
    if (subpath.startsWith(prefix)) {
      const target = unpackExportTarget(value);
      if (target) return target.replace('*', subpath.slice(prefix.length));
    }
  }
  return null;
}

/**
 * Resolve an import specifier to an absolute file path.
 * Relative → extension/index probing; `@galaxy/*` → the target package's
 * `exports` map then `main` then conventional src/ layout; then the
 * importer's tsconfig `paths`. Returns null when unresolvable.
 */
export function resolveSpecifier(specifier, fromFile, ws) {
  const probe = (base) => {
    if (fs.existsSync(base) && fs.statSync(base).isFile()) {
      return EXTS.some((e) => base.endsWith(e)) ? base : null;
    }
    for (const ext of EXTS) {
      const p = `${base}${ext}`;
      if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
    }
    for (const ext of EXTS) {
      const p = path.join(base, `index${ext}`);
      if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
    }
    return null;
  };

  if (specifier.startsWith('.')) {
    return probe(path.resolve(path.dirname(fromFile), specifier));
  }

  if (specifier.startsWith('@galaxy/')) {
    const segments = specifier.split('/');
    const name = segments.slice(0, 2).join('/');
    const pkg = ws.registry.get(name);
    if (!pkg) return null;
    const rest = segments.slice(2);
    const subpath = rest.length ? `./${rest.join('/')}` : '.';
    const target = resolveExports(pkg.exports, subpath);
    if (target) {
      const resolved = probe(path.resolve(pkg.root, target));
      if (resolved) return resolved;
    }
    if (pkg.main) {
      const resolved = probe(path.resolve(pkg.root, pkg.main));
      if (resolved) return resolved;
    }
    return probe(path.join(pkg.root, 'src', ...rest));
  }

  const owner = findOwnerPackage(fromFile, ws.packages);
  if (owner) {
    for (const [pattern, targets] of Object.entries(owner.tsconfigPaths)) {
      const starIdx = pattern.indexOf('*');
      if (starIdx === -1) continue;
      const prefix = pattern.slice(0, starIdx);
      if (!specifier.startsWith(prefix)) continue;
      const rest = specifier.slice(prefix.length);
      for (const target of targets) {
        const resolved = probe(path.resolve(owner.root, target.replace('*', rest)));
        if (resolved) return resolved;
      }
    }
  }
  return null;
}

/** Build the static import graph over all scanned files. */
export function buildFileGraph(ws) {
  const files = [];
  for (const root of ws.roots) collectFiles(root, files);
  const fileSet = new Set(files);
  const edges = new Map();
  const unresolved = new Set();
  for (const file of files) {
    let content;
    try {
      content = fs.readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    const tos = new Set();
    for (const spec of parseImports(content).static) {
      const resolved = resolveSpecifier(spec, file, ws);
      if (resolved && fileSet.has(resolved)) tos.add(resolved);
      else if (!resolved) unresolved.add(spec);
    }
    edges.set(file, tos);
  }
  let edgeCount = 0;
  for (const tos of edges.values()) edgeCount += tos.size;
  return { edges, nodes: fileSet, files, unresolved, fileCount: files.length, edgeCount };
}

function findCyclePath(start, sccSet, edges) {
  const pathArr = [start];
  const visited = new Set([start]);
  const dfs = (cur) => {
    for (const next of edges.get(cur) ?? []) {
      if (!sccSet.has(next)) continue;
      if (next === start) return [...pathArr, start];
      if (visited.has(next)) continue;
      visited.add(next);
      pathArr.push(next);
      const found = dfs(next);
      if (found) return found;
      pathArr.pop();
    }
    return null;
  };
  return dfs(start) ?? [start];
}

/** Tarjan SCC over the file graph; returns cycles (≥2 nodes) and self-loops. */
export function findCycles(edges) {
  const nodes = new Set();
  for (const [from, tos] of edges) {
    nodes.add(from);
    for (const t of tos) nodes.add(t);
  }
  const index = new Map();
  const low = new Map();
  const onStack = new Set();
  const stack = [];
  let counter = 0;
  const sccs = [];
  const strongconnect = (v) => {
    index.set(v, counter);
    low.set(v, counter);
    counter += 1;
    stack.push(v);
    onStack.add(v);
    for (const w of edges.get(v) ?? []) {
      if (!index.has(w)) {
        strongconnect(w);
        low.set(v, Math.min(low.get(v), low.get(w)));
      } else if (onStack.has(w)) {
        low.set(v, Math.min(low.get(v), index.get(w)));
      }
    }
    if (low.get(v) === index.get(v)) {
      const scc = [];
      let w;
      do {
        w = stack.pop();
        onStack.delete(w);
        scc.push(w);
      } while (w !== v);
      if (scc.length >= 2) sccs.push(scc);
    }
  };
  for (const v of nodes) if (!index.has(v)) strongconnect(v);

  const cycles = sccs.map((scc) => ({
    files: scc,
    path: findCyclePath(scc[0], new Set(scc), edges),
  }));
  const selfLoops = [];
  for (const [from, tos] of edges) if (tos.has(from)) selfLoops.push(from);
  return { cycles, selfLoops };
}

/** Part A — ARCH-003 forbidden `workspace:` package dependencies. */
export function checkForbiddenPackageEdges(registry, forbiddenPairs = FORBIDDEN_PAIRS) {
  const violations = [];
  for (const [fromName, toName] of forbiddenPairs) {
    const pkg = registry.get(fromName);
    if (!pkg || !pkg.workspaceDeps.has(toName)) continue;
    violations.push(
      `${fromName} -> ${toName} (ARCH-003 forbidden dependency, declared in ${pkg.workspaceDeps.get(toName)})`,
    );
  }
  return violations;
}

/** Part B — ARCH-003 forbidden cross-package file imports (covers undeclared edges). */
export function checkForbiddenFileEdges(ws, edges, forbiddenPairs = FORBIDDEN_PAIRS) {
  const violations = [];
  const forbidden = new Set(forbiddenPairs.map(([a, b]) => `${a}\u0000${b}`));
  for (const [from, tos] of edges) {
    const fromPkg = findOwnerPackage(from, ws.packages);
    if (!fromPkg) continue;
    for (const to of tos) {
      const toPkg = findOwnerPackage(to, ws.packages);
      if (!toPkg || toPkg.name === fromPkg.name) continue;
      if (forbidden.has(`${fromPkg.name}\u0000${toPkg.name}`)) {
        violations.push(
          `${fromPkg.name} -> ${toPkg.name} (ARCH-003): ${path
            .relative(ws.rootDir, from)
            .replaceAll('\\', '/')} imports ${path.relative(ws.rootDir, to).replaceAll('\\', '/')}`,
        );
      }
    }
  }
  return violations;
}

/** Full analysis of a workspace root: graph, cycles, ARCH-003 violations. */
export function analyzeWorkspace(rootDir) {
  const ws = loadWorkspace(rootDir);
  const graph = buildFileGraph(ws);
  const cycles = findCycles(graph.edges);
  const forbiddenEdges = checkForbiddenPackageEdges(ws.registry);
  const forbiddenImports = checkForbiddenFileEdges(ws, graph.edges);
  return { ws, graph, cycles, forbiddenEdges, forbiddenImports };
}

export function main() {
  const rootDir = path.resolve(process.argv[2] ?? process.cwd());
  const { ws, graph, cycles, forbiddenEdges, forbiddenImports } = analyzeWorkspace(rootDir);
  const problemCount =
    forbiddenEdges.length +
    forbiddenImports.length +
    cycles.cycles.length +
    cycles.selfLoops.length;

  console.log(
    `architecture gate: ${ws.packages.length} packages, ${graph.fileCount} files, ${graph.edgeCount} static edges`,
  );
  console.log(`unresolved specifiers: ${graph.unresolved.size}`);

  if (forbiddenEdges.length) {
    console.error('FAIL: forbidden package dependencies (ARCH-003):');
    for (const v of forbiddenEdges) console.error(`  - ${v}`);
  }
  if (forbiddenImports.length) {
    console.error('FAIL: forbidden cross-package imports (ARCH-003):');
    for (const v of forbiddenImports) console.error(`  - ${v}`);
  }
  if (cycles.cycles.length) {
    console.error('FAIL: circular dependencies:');
    for (const c of cycles.cycles) {
      const rel = c.path.map((f) => path.relative(rootDir, f).replaceAll('\\', '/')).join(' -> ');
      console.error(`  - ${rel}`);
    }
  }
  if (cycles.selfLoops.length) {
    console.error('FAIL: files importing themselves:');
    for (const f of cycles.selfLoops) {
      console.error(`  - ${path.relative(rootDir, f).replaceAll('\\', '/')}`);
    }
  }
  if (problemCount > 0) {
    console.error(`architecture gate FAILED (${problemCount} violation(s))`);
    process.exit(1);
  }
  console.log('architecture gate PASSED');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
