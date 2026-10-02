#!/usr/bin/env node
/**
 * Image registry URL gate (CI) — audit D3.
 *
 * Every URL in packages/shared/src/images/index.ts must resolve to a 2xx
 * response. Broken image URLs previously made 37 of 43 hero/service images
 * 404 (masked by onError fallbacks). This gate keeps the registry honest.
 *
 * Runs in the Dependency Audit CI job (network available, ~43 requests).
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const UNSHPLASH_BASE = 'https://images.unsplash.com/';
const PICSUM_BASE = 'https://picsum.photos/seed/';

/**
 * Pure registry parsing: U('photo-...') — Unsplash helper, P('seed') —
 * picsum helper. Returns the fully-qualified URLs the gate checks.
 */
export function extractUrls(source) {
  const us = [...source.matchAll(/U\('([^']+)'/g)].map((m) => m[1]);
  const ps = [...source.matchAll(/P\('([^']+)'/g)].map((m) => m[1]);
  return [
    ...us.map((id) => `${UNSHPLASH_BASE}${id}?w=100&h=100&fit=crop&auto=format`),
    ...ps.map((seed) => `${PICSUM_BASE}${seed}/100/100`),
  ];
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const here = dirname(fileURLToPath(import.meta.url));
  const indexPath = resolve(here, '../packages/shared/src/images/index.ts');
  const urls = extractUrls(readFileSync(indexPath, 'utf8'));

  const timeout = 20_000;
  const check = (url) =>
    fetch(url, { method: 'GET', signal: AbortSignal.timeout(timeout) })
      .then((r) => ({ url, status: r.status, ok: r.status >= 200 && r.status < 300 }))
      .catch(() => ({ url, status: 0, ok: false }));

  const results = await Promise.all(urls.map(check));
  const bad = results.filter((r) => !r.ok);

  console.log(`image-urls: checked ${results.length} registry URLs`);
  if (bad.length > 0) {
    console.error(`FAIL: ${bad.length} image URL(s) do not resolve:`);
    for (const b of bad) console.error(`  ${b.status} ${b.url}`);
    process.exit(1);
  }
  console.log('image-urls: all resolve');
}
