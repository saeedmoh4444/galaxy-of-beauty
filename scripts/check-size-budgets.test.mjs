import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import crypto from 'node:crypto';
import zlib from 'node:zlib';

import { collectPageRoutes, evaluate } from './check-size-budgets.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const fxWeb = path.join(here, 'test-fixtures', 'budgets', 'web');
const chunk = (name) => path.join(fxWeb, '.next', 'static', 'chunks', name);
const gzBytes = (file) => zlib.gzipSync(fs.readFileSync(file), { level: 9 }).length;
const GENEROUS = { public: 1000, auth: 1000, dashboard: 1000, admin: 1000 };

const run = (overrides = {}) =>
  evaluate({
    webRoot: fxWeb,
    appDir: path.join(fxWeb, 'src', 'app'),
    statsPath: path.join(fxWeb, '.next', 'diagnostics', 'route-bundle-stats.json'),
    baseline: GENEROUS,
    tolerance: 0.05,
    ...overrides,
  });

test('collectPageRoutes maps pages to URL routes and budget classes', () => {
  const classes = collectPageRoutes(path.join(fxWeb, 'src', 'app'));
  assert.deepEqual(Object.fromEntries([...classes].sort()), {
    '/': 'public',
    '/admin/users': 'admin',
    '/dashboard': 'dashboard',
    '/login': 'auth',
  });
});

test('evaluate aggregates gzipped chunk sums and normalizes Windows paths', () => {
  const res = run();
  assert.equal(res.violations.length, 0);
  assert.deepEqual(Object.keys(res.perClass).sort(), ['admin', 'auth', 'dashboard', 'public']);
  // worst public route is "/" (a+b), gzipped sum matches chunk gzip math
  const expected = (gzBytes(chunk('a.js')) + gzBytes(chunk('b.js'))) / 1024;
  assert.equal(res.perClass.public.worstRoute, '/');
  assert.ok(Math.abs(res.perClass.public.worstKB - expected) < 0.05);
  // admin class uses only chunk b
  assert.equal(res.perClass.admin.worstRoute, '/admin/users');
});

test('excluded routes are skipped and unmatched routes default to public', () => {
  const res = run();
  assert.ok(!res.unmatched.includes('/api/health'));
  assert.ok(!res.unmatched.includes('/_not-found'));
  assert.ok(res.unmatched.includes('/offline'));
  // /offline still counted against the public class worst computation set
  assert.ok(['/', '/offline'].includes(res.perClass.public.worstRoute));
});

test('wrong stats claim triggers a cross-check warning', () => {
  const res = run();
  assert.ok(res.warnings.some((w) => w.includes('/dashboard')));
});

test('route over baseline fails and names the offender', () => {
  const res = run({ baseline: { public: 0.001, auth: 1000, dashboard: 1000, admin: 1000 } });
  assert.equal(res.violations.length, 1);
  assert.match(res.violations[0], /public/);
  assert.match(res.violations[0], /exceeds/);
});

test('missing stats file throws with a remediation hint', () => {
  assert.throws(
    () => run({ statsPath: path.join(fxWeb, 'nope.json') }),
    /route-bundle-stats|rebuild|build/,
  );
});

test('STRICT mode enforces FE-007 budgets directly', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'budget-strict-'));
  try {
    fs.cpSync(fxWeb, dir, { recursive: true });
    const big = path.join(dir, '.next', 'static', 'chunks', 'big.js');
    fs.mkdirSync(path.dirname(big), { recursive: true });
    fs.writeFileSync(big, crypto.randomBytes(110 * 1024));
    const statsPath = path.join(dir, '.next', 'diagnostics', 'route-bundle-stats-strict.json');
    fs.writeFileSync(
      statsPath,
      JSON.stringify([
        {
          route: '/',
          firstLoadUncompressedJsBytes: fs.statSync(big).size,
          firstLoadChunkPaths: ['.next/static/chunks/big.js'],
        },
      ]),
    );
    const res = run({
      webRoot: dir,
      appDir: path.join(dir, 'src', 'app'),
      statsPath,
      strict: true,
    });
    assert.equal(res.violations.length, 1);
    assert.match(res.violations[0], /FE-007/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
