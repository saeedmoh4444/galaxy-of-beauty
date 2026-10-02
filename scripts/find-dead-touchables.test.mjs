import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { scan, stripComments, tagEnd } from './find-dead-touchables.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));

test('stripComments removes //, /* */ and {/* */} while preserving line numbers', () => {
  const src = [
    'const a = 1; // <TouchableOpacity>x</TouchableOpacity>',
    '/* <TouchableOpacity>y</TouchableOpacity> */',
    'const b = {/* <TouchableOpacity>z</TouchableOpacity> */ 2};',
    'const c = "// not a comment";',
  ].join('\n');
  const out = stripComments(src);
  assert.ok(!out.includes('x</TouchableOpacity>'));
  assert.ok(!out.includes('y</TouchableOpacity>'));
  assert.ok(!out.includes('z</TouchableOpacity>'));
  assert.ok(out.includes('"// not a comment"'));
  assert.equal(out.split('\n').length, src.split('\n').length);
});

test('tagEnd skips nested braces and strings', () => {
  const src = '<TouchableOpacity style={{ padding: 2 }} onPress={() => {}} className=">">';
  const end = tagEnd(src, '<TouchableOpacity'.length);
  assert.equal(src[end], '>');
  assert.ok(end === src.length - 1);
});

test('scan finds dead touchables and skips wired ones', () => {
  const dir = mkdtempSync(join(tmpdir(), 'touchables-'));
  mkdirSync(join(dir, 'nested'), { recursive: true });
  writeFileSync(
    join(dir, 'wired.tsx'),
    `<TouchableOpacity onPress={() => {}}>\n  <Text>x</Text>\n</TouchableOpacity>\n`,
  );
  writeFileSync(
    join(dir, 'dead.tsx'),
    `<TouchableOpacity style={s.card}>\n  <Text>y</Text>\n</TouchableOpacity>\n`,
  );
  writeFileSync(
    join(dir, 'nested', 'spread.tsx'),
    `<TouchableOpacity {...props} style={s.card}>\n  <Text>z</Text>\n</TouchableOpacity>\n`,
  );
  const { checked, findings } = scan(dir);
  assert.equal(checked, 3);
  assert.deepEqual(
    findings.map((f) => ({ file: f.file, line: f.line })),
    [{ file: 'dead.tsx', line: 1 }],
  );
  const strict = scan(dir, { strict: true });
  assert.equal(strict.findings.length, 2);
  rmSync(dir, { recursive: true, force: true });
});

test('whole app has zero dead touchables (M8 regression gate)', () => {
  const { checked, findings } = scan(join(here, '../apps/mobile/src'));
  assert.ok(checked > 300, `expected 300+ touchables, found ${checked}`);
  assert.deepEqual(
    findings,
    [],
    `dead touchables remain:\n${findings.map((f) => `${f.file}:${f.line}`).join('\n')}`,
  );
});
