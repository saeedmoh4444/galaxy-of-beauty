import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { extractUrls, IMAGERY_FILE } from './check-image-urls.mjs';

test('extracts Unsplash and picsum URLs from the registry helpers', () => {
  const urls = extractUrls(`
    export const heroImage = U('photo-1700000000000-abcdef123456');
    export const other = U('photo-1800000000000-fedcba654321');
    export const seed = P('galaxy-salon');
  `);
  assert.deepEqual(urls, [
    'https://images.unsplash.com/photo-1700000000000-abcdef123456?w=100&h=100&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1800000000000-fedcba654321?w=100&h=100&fit=crop&auto=format',
    'https://picsum.photos/seed/galaxy-salon/100/100',
  ]);
});

test('ignores double-quoted helper calls and non-helper text', () => {
  const urls = extractUrls(`const a = U("photo-999"); const b = 'P(not-real)';`);
  assert.deepEqual(urls, []);
});

test('returns an empty list for an empty registry', () => {
  assert.deepEqual(extractUrls('// no images yet'), []);
});

test('the imagery pool file parses and yields 80+ live-shaped URLs', () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const source = readFileSync(resolve(here, IMAGERY_FILE), 'utf8');
  const urls = extractUrls(source);
  assert.ok(urls.length >= 80, `expected >=80 pool URLs, got ${urls.length}`);
  for (const url of urls) {
    assert.match(
      url,
      /^https:\/\/images\.unsplash\.com\/photo-[0-9a-f-]+\?w=100&h=100&fit=crop&auto=format$/,
    );
  }
});
