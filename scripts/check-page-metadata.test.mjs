import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { scan } from './check-page-metadata.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));

test('every public page exports metadata outside the allowlist (W6-1 gate)', () => {
  const { unmigrated } = scan(
    join(here, '../apps/web/src/app'),
    join(here, 'static-page-metadata-allowlist.txt'),
  );
  assert.deepEqual(
    unmigrated,
    [],
    `public pages without generateMetadata/metadata:\n${unmigrated.join('\n')}`,
  );
});

test('a page exporting generateMetadata passes the gate', () => {
  const { unmigrated } = scan(
    join(here, '../apps/web/src/app/(public)/services'),
    join(here, 'static-page-metadata-allowlist.txt'),
  );
  assert.deepEqual(unmigrated, []);
});
