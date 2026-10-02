import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { scan } from './find-static-arabic.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));

test('scan flags hardcoded Arabic but skips t() keys and comments', () => {
  const dir = mkdtempSync(join(tmpdir(), 'arabic-'));
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, 'screen.tsx'),
    [
      '// تعليق عربي يجب تجاهله',
      '/* تعليق آخر */',
      "const ok = t('mobile.key.arabic');",
      '<Text>نص ثابت يجب ترجمته</Text>',
      "<Text>{t('mobile.other')} ونص مختلط</Text>",
    ].join('\n'),
  );
  const { findings } = scan(dir);
  assert.deepEqual(
    findings.map((f) => f.line),
    [4, 5],
  );
  rmSync(dir, { recursive: true, force: true });
});

test('whole app has zero static Arabic outside the allowlist (gate)', () => {
  const { findings } = scan(join(here, '../apps/mobile/src'));
  assert.deepEqual(
    findings,
    [],
    `static Arabic outside t()/allowlist:\n${findings
      .slice(0, 20)
      .map((f) => `${f.file}:${f.line}`)
      .join('\n')}`,
  );
});
