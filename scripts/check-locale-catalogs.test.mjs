import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { splitByLocale } from './generate-locale-catalogs.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');

test('splitByLocale builds flat per-locale maps from {ar,en} domain catalogs', () => {
  const { en, ar, collisions } = splitByLocale([
    {
      name: 'core',
      catalog: { 'a.one': { ar: '١', en: 'One' }, 'a.two': { ar: '٢', en: 'Two' } },
    },
    { name: 'nav', catalog: { 'b.home': { ar: 'بيت', en: 'Home' } } },
  ]);
  assert.deepEqual(en, { 'a.one': 'One', 'a.two': 'Two', 'b.home': 'Home' });
  assert.deepEqual(ar, { 'a.one': '١', 'a.two': '٢', 'b.home': 'بيت' });
  assert.deepEqual(collisions, []);
});

test('splitByLocale reports later-domain overrides as collisions (spread-merge parity)', () => {
  const { en, ar, collisions } = splitByLocale([
    { name: 'first', catalog: { 'dup.key': { ar: 'a1', en: 'b1' } } },
    { name: 'second', catalog: { 'dup.key': { ar: 'a2', en: 'b2' } } },
  ]);
  assert.equal(en['dup.key'], 'b2'); // later wins — same as today's object spread
  assert.equal(ar['dup.key'], 'a2');
  assert.equal(collisions.length, 1);
});

test('splitByLocale rejects keys that are not { ar: string; en: string }', () => {
  assert.throws(() => splitByLocale([{ name: 'bad', catalog: { 'x.y': { ar: 'x' } } }]), /x\.y/);
});

test('generated locale catalogs match the domain sources (drift guard)', () => {
  const r = spawnSync(
    process.execPath,
    ['--experimental-strip-types', 'scripts/generate-locale-catalogs.mjs', '--check'],
    { cwd: repoRoot, encoding: 'utf8' },
  );
  assert.equal(r.status, 0, `drift detected:\n${r.stdout}\n${r.stderr}`);
});
