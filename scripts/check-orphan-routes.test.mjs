import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { scan, references } from './check-orphan-routes.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));

test('references: static routes match their literal prefix', () => {
  assert.ok(references("push('/customer/bookings')", 'customer/bookings', '/customer/bookings'));
  assert.ok(
    !references("push('/customer/bookings')", 'customer/bookings/list', '/customer/bookings/list'),
  );
});

test('references: terminal dynamic route needs the template open', () => {
  // `/x/${id}` reaches [id]; a bare parent list link does not.
  assert.ok(
    references(
      'push(`/customer/group-bookings/${g.id}`)',
      'customer/group-bookings/[id]',
      '/customer/group-bookings/',
    ),
  );
  assert.ok(
    !references(
      "push('/customer/group-bookings')",
      'customer/group-bookings/[id]',
      '/customer/group-bookings/',
    ),
  );
});

test('references: mid-path dynamic route matches both literal parts', () => {
  assert.ok(
    references(
      'push(`/customer/video/${bookingId}/room`)',
      'customer/video/[bookingId]/room',
      '/customer/video/room',
    ),
  );
  assert.ok(
    !references(
      'push(`/customer/video/${bookingId}`)',
      'customer/video/[bookingId]/room',
      '/customer/video/room',
    ),
  );
});

function makeApp(dir, { tab = true } = {}) {
  const app = join(dir, 'src', 'app');
  mkdirSync(join(app, 'hub'), { recursive: true });
  mkdirSync(join(app, 'detail'), { recursive: true });
  if (tab) mkdirSync(join(app, '(tabs)'), { recursive: true });
  writeFileSync(join(app, 'hub', 'index.tsx'), "router.push('/detail')");
  writeFileSync(join(app, 'detail', 'index.tsx'), 'export default () => null;');
  writeFileSync(join(app, 'index.tsx'), "router.replace('/hub')"); // root entry wires hub
  return app;
}

test('scan: hub-wired route is not orphaned, unwired one is', () => {
  const dir = mkdtempSync(join(tmpdir(), 'orphans-'));
  const app = makeApp(dir);
  // `detail` is wired by hub; `detail` itself has no inbound from others.
  const { orphans } = scan(dir);
  assert.ok(!orphans.includes('/detail'), `wired route flagged: ${orphans.join(', ')}`);
  assert.ok(!orphans.includes('/hub'));
  rmSync(dir, { recursive: true, force: true });
});

test('scan: unwired route is flagged', () => {
  const dir = mkdtempSync(join(tmpdir(), 'orphans-'));
  const app = makeApp(dir);
  mkdirSync(join(app, 'lonely'), { recursive: true });
  writeFileSync(join(app, 'lonely', 'index.tsx'), 'export default () => null;');
  const { orphans } = scan(dir);
  assert.ok(orphans.includes('/lonely'), `expected /lonely, got: ${orphans.join(', ')}`);
  rmSync(dir, { recursive: true, force: true });
});

test('whole app has zero orphaned routes (M7 regression gate)', () => {
  const { orphans, checked } = scan(join(here, '../apps/mobile'));
  assert.ok(checked > 300, `expected 300+ routes, found ${checked}`);
  assert.deepEqual(orphans, [], `orphaned routes remain:\n${orphans.join('\n')}`);
});
