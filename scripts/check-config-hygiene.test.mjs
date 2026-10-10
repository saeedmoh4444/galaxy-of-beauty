import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');
const read = (p) => fs.readFileSync(path.join(repoRoot, p), 'utf8');

test('next.config.js no longer carries the deprecated eslint key', () => {
  const config = read('apps/web/next.config.js');
  assert.doesNotMatch(
    config,
    /^\s*eslint\s*:/m,
    'Next 16 dropped build-time linting; the eslint key is a no-op warning source',
  );
});

test('storage.ts opts every dynamic filesystem access out of Turbopack output tracing', () => {
  const src = read('packages/api/src/lib/storage.ts');
  const markers = (src.match(/turbopackIgnore: true/g) ?? []).length;
  assert.ok(
    markers >= 8,
    `expected >=8 turbopackIgnore markers (LOCAL_UPLOAD_DIR + fs sites), found ${markers}`,
  );
  for (const [i, line] of src.split('\n').entries()) {
    if (
      /\bfs\.(existsSync|mkdirSync|unlink|writeFile|readFile|readdir|stat|rename|promises\.)/.test(
        line,
      )
    ) {
      assert.match(
        line,
        /turbopackIgnore: true/,
        `unflagged dynamic filesystem access at storage.ts:${i + 1}`,
      );
    }
  }
});
