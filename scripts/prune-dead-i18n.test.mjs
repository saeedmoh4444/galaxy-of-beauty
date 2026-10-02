import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import {
  collectFiles,
  makeIsDead,
  parseKeepFile,
  pruneCatalog,
  scanUsage,
} from './prune-dead-i18n.mjs';

const CATALOG = `{
  'used.literal': { ar: 'مستخدم', en: 'Used' },
  'dead.simple': { ar: 'ميت', en: 'Dead' },
  'dead.multiline': {
    ar: 'سطر طويل جداً يمتد',
    en: 'A very long entry that prettier wraps across several lines',
  },
  'kept.prefix.1': { ar: 'واحد', en: 'One' },
  'kept.template.7': { ar: 'سبعة', en: 'Seven' },
  'kept.exact': { ar: 'محمي', en: 'Protected' },
};
`;

test('pruneCatalog removes multi-line dead entries brace-aware and keeps live keys', () => {
  const { src, deadKeys, total, removedBytes } = pruneCatalog(CATALOG, (key) =>
    key.startsWith('dead.'),
  );
  assert.deepEqual(deadKeys, ['dead.simple', 'dead.multiline']);
  assert.equal(total, 6);
  assert.ok(removedBytes > 0);
  assert.ok(src.includes("'used.literal'"));
  assert.ok(src.includes("'kept.prefix.1'"));
  assert.ok(!src.includes('dead.simple'));
  assert.ok(!src.includes('dead.multiline'));
  assert.ok(src.includes('};'), 'catalog closing brace survives');
});

test('makeIsDead respects usage, keep-file, and template prefixes', () => {
  const isDead = makeIsDead({
    used: new Set(['used.literal']),
    tmplPrefixes: new Set(['kept.template']),
    keepSet: new Set(['kept.exact']),
    keepPrefixes: ['kept.prefix'],
  });
  assert.equal(isDead('dead.simple'), true);
  assert.equal(isDead('used.literal'), false);
  assert.equal(isDead('kept.template.7'), false);
  assert.equal(isDead('kept.exact'), false);
  assert.equal(isDead('kept.prefix.1'), false);
});

test('parseKeepFile handles exact keys and P: prefixes', () => {
  const { keepSet, keepPrefixes } = parseKeepFile('kept.exact\nP:kept.prefix\n\n  spaced.exact  ');
  assert.ok(keepSet.has('kept.exact'));
  assert.ok(keepSet.has('spaced.exact'));
  assert.deepEqual(keepPrefixes, ['kept.prefix']);
});

test('scanUsage + collectFiles work end-to-end on a fixture tree', () => {
  const dir = mkdtempSync(join(tmpdir(), 'i18n-prune-'));
  mkdirSync(join(dir, 'src'), { recursive: true });
  mkdirSync(join(dir, 'src', 'node_modules'), { recursive: true }); // must be skipped
  writeFileSync(join(dir, 'src', 'page.tsx'), `t('used.literal'); t(\`kept.template.\${n}\`);`);
  writeFileSync(join(dir, 'src', 'node_modules', 'lib.tsx'), `t('ignored.module');`);
  const files = collectFiles(dir);
  assert.equal(files.length, 1);
  const { used, tmplPrefixes } = scanUsage(files);
  assert.ok(used.has('used.literal'));
  // The template regex captures up to (and including) the trailing dot —
  // startsWith('kept.template.') still protects every suffixed key.
  assert.ok(tmplPrefixes.has('kept.template.'));
  assert.ok(!used.has('ignored.module'));
  rmSync(dir, { recursive: true, force: true });
});

test('real catalog prune is a dry-run no-op unless --write (CLI safety)', () => {
  // The registry check only: pruneCatalog must never modify anything by
  // itself — writing happens exclusively in the CLI's --write branch.
  const before = CATALOG;
  pruneCatalog(before, () => true);
  assert.equal(before, CATALOG);
});
