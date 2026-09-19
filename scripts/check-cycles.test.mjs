import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { analyzeWorkspace, checkForbiddenPackageEdges, parseImports } from './check-cycles.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const fx = (name) => path.join(here, 'test-fixtures', 'cycles', name);

test('parseImports separates static, dynamic and type-only specifiers', () => {
  const { static: s, dynamic: d } = parseImports(`
import a from './a';
import type { T } from './t';
export { b } from './b';
export type { U } from './u';
const dyn = () => import('./dyn');
const req = require('./req');
`);
  assert.deepEqual([...s].sort(), ['./a', './b']);
  assert.deepEqual([...d].sort(), ['./dyn', './req']);
});

test('clean workspace passes with zero violations (tsconfig paths alias resolves)', () => {
  const result = analyzeWorkspace(fx('clean'));
  assert.equal(result.cycles.cycles.length, 0, JSON.stringify(result.cycles));
  assert.equal(result.forbiddenEdges.length, 0);
  assert.equal(result.forbiddenImports.length, 0);
  // 2 files, one static edge through the @/* tsconfig alias
  assert.equal(result.graph.fileCount, 2);
  assert.equal(result.graph.edgeCount, 1);
});

test('two-file cycle is detected', () => {
  const result = analyzeWorkspace(fx('two-file-cycle'));
  assert.equal(result.cycles.cycles.length, 1);
  const cycle = result.cycles.cycles[0];
  assert.equal(cycle.files.length, 2);
  const names = cycle.files.map((f) => path.basename(f)).sort();
  assert.deepEqual(names, ['a.ts', 'b.ts']);
});

test('cycle through an exports-map subpath is detected', () => {
  const result = analyzeWorkspace(fx('exports-cycle'));
  assert.equal(result.cycles.cycles.length, 1);
  const files = result.cycles.cycles[0].files.map((f) => path.basename(f)).sort();
  assert.deepEqual(files, ['index.ts', 'sub.ts']);
});

test('forbidden workspace dependency fails the package-level check', () => {
  const ws = analyzeWorkspace(fx('forbidden-dep')).ws;
  const violations = checkForbiddenPackageEdges(ws.registry, [
    ['@galaxy/fix-api', '@galaxy/fix-ui'],
  ]);
  assert.equal(violations.length, 1);
  assert.match(violations[0], /@galaxy\/fix-api/);
  assert.match(violations[0], /@galaxy\/fix-ui/);
});

test('dynamic import breaks an otherwise-cyclic pair (sanctioned pattern)', () => {
  const result = analyzeWorkspace(fx('dynamic-break'));
  assert.equal(result.cycles.cycles.length, 0, JSON.stringify(result.cycles));
});
