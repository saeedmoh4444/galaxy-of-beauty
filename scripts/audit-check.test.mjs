import { test } from 'node:test';
import assert from 'node:assert/strict';

import { evaluateReport } from './audit-check.mjs';

test('passes with no vulnerabilities', () => {
  const r = evaluateReport({ metadata: { vulnerabilities: {} } });
  assert.deepEqual(r, { critical: 0, high: 0, moderate: 0, low: 0, pass: true });
});

test('fails on any critical advisory', () => {
  const r = evaluateReport({ metadata: { vulnerabilities: { critical: 1, high: 3 } } });
  assert.equal(r.pass, false);
  assert.equal(r.critical, 1);
});

test('high advisories do not block (SECURITY.md baseline)', () => {
  const r = evaluateReport({
    metadata: { vulnerabilities: { high: 7, moderate: 2, low: 1 } },
  });
  assert.equal(r.pass, true);
  assert.equal(r.high, 7);
});

test('malformed report (missing metadata) defaults to zero counts', () => {
  const r = evaluateReport({});
  assert.equal(r.pass, true);
  assert.deepEqual(
    { critical: r.critical, high: r.high, moderate: r.moderate, low: r.low },
    { critical: 0, high: 0, moderate: 0, low: 0 },
  );
});
