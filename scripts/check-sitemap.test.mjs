import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');
const appDir = path.join(repoRoot, 'apps', 'web', 'src', 'app');

const sitemapSrc = fs.readFileSync(path.join(appDir, 'sitemap.ts'), 'utf8');
const urls = [...sitemapSrc.matchAll(/url:\s*'([^']+)'/g)].map((m) => m[1]);

const AUTH_GROUPS = ['(customer)', '(auth)', '(technician)', '(store)'];

test('every sitemap URL maps to a public web page file', () => {
  const missing = [];
  for (const u of urls) {
    const candidates = [
      path.join(appDir, u, 'page.tsx'),
      path.join(appDir, '(public)', u, 'page.tsx'),
    ];
    if (!candidates.some((p) => fs.existsSync(p))) missing.push(u);
  }
  assert.deepEqual(
    missing,
    [],
    `sitemap URLs with no page file (dead entries): ${missing.join(', ')}`,
  );
});

test('the sitemap never lists auth-gated routes', () => {
  const offenders = [];
  for (const u of urls) {
    for (const g of AUTH_GROUPS) {
      if (fs.existsSync(path.join(appDir, g, u, 'page.tsx'))) offenders.push(`${u} (${g})`);
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `auth-gated routes in the public sitemap: ${offenders.join(', ')}`,
  );
});
