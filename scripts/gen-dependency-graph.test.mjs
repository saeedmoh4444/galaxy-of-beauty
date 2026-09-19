import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

import { loadWorkspace } from './check-cycles.mjs';
import { generateGraph, checkFresh, HEADER } from './gen-dependency-graph.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const fx = (name) => path.join(here, 'test-fixtures', 'cycles', name);

test('runtime workspace dependency renders as a solid edge', () => {
  const ws = loadWorkspace(fx('forbidden-dep'));
  const out = generateGraph(ws);
  assert.ok(out.startsWith(`${HEADER}\n`));
  assert.match(
    out,
    /pkg__galaxy_fix_api\["@galaxy\/fix-api"\] --> pkg__galaxy_fix_ui\["@galaxy\/fix-ui"\]/,
  );
});

test('devDependency renders as a dashed edge, never solid', () => {
  const ws = loadWorkspace(fx('dev-dep'));
  const out = generateGraph(ws);
  assert.match(
    out,
    /pkg__galaxy_tool\["@galaxy\/tool"\] -\.-> pkg__galaxy_core\["@galaxy\/core"\]/,
  );
  assert.doesNotMatch(
    out,
    /pkg__galaxy_tool\["@galaxy\/tool"\] --> pkg__galaxy_core\["@galaxy\/core"\]/,
  );
});

test('checkFresh passes on freshly generated output and fails on drift', () => {
  const ws = loadWorkspace(fx('forbidden-dep'));
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'graph-'));
  const outPath = path.join(dir, 'dependency-graph.md');
  try {
    fs.writeFileSync(outPath, generateGraph(ws));
    assert.equal(checkFresh(fx('forbidden-dep'), outPath), true);

    fs.appendFileSync(outPath, '\n<!-- drift -->\n');
    assert.equal(checkFresh(fx('forbidden-dep'), outPath), false);

    // CRLF on disk (Windows checkout) must not count as drift
    fs.writeFileSync(outPath, generateGraph(ws).replaceAll('\n', '\r\n'));
    assert.equal(checkFresh(fx('forbidden-dep'), outPath), true);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
