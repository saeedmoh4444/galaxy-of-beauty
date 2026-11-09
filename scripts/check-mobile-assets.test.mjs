/**
 * E2 — mobile asset budgets (app-size trim). The checker must fail the
 * build when a single asset or the total exceeds the caps, and pass a
 * healthy asset set. Pure logic — no filesystem access in the tests.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateAssets, DEFAULT_LIMITS } from './check-mobile-assets.mjs';

test('passes a healthy asset set', () => {
  const files = [
    { path: 'assets/icon.png', size: 126_757 },
    { path: 'assets/logo.png', size: 17_260 },
    { path: 'assets/notification-icon.png', size: 8_327 },
  ];
  const result = evaluateAssets(files, DEFAULT_LIMITS);
  assert.equal(result.ok, true);
  assert.equal(result.violations.length, 0);
  assert.equal(result.totalBytes, 152_344);
});

test('flags a single oversized asset', () => {
  const files = [{ path: 'assets/hero.png', size: 2 * 1024 * 1024 }];
  const result = evaluateAssets(files, DEFAULT_LIMITS);
  assert.equal(result.ok, false);
  assert.equal(result.violations.length, 1);
  assert.match(result.violations[0], /hero\.png/);
});

test('flags a total over budget', () => {
  const files = Array.from({ length: 5 }, (_, i) => ({
    path: `assets/big-${i}.png`,
    size: 900_000,
  }));
  const result = evaluateAssets(files, DEFAULT_LIMITS);
  assert.equal(result.ok, false);
  assert.match(result.violations.join('\n'), /total/i);
});

test('empty set passes', () => {
  const result = evaluateAssets([], DEFAULT_LIMITS);
  assert.equal(result.ok, true);
});
