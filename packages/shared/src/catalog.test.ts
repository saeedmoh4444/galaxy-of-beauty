/**
 * Shared package smoke tests (audit stage 10 — shared had zero tests).
 * The i18n integrity checks regression-guard the S3 dedupe/trim work:
 * every catalog key must carry both locales with no leading-space defects.
 */
import { describe, it, expect } from 'vitest';
import { globSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildBundleQuote } from './bundlePricing';
import { webMessages, mobileMessages, sharedMessages } from './i18n';

function collectBlocks(src: string): Array<{ key: string; block: string }> {
  const out: Array<{ key: string; block: string }> = [];
  const keyRe = /'([^']+)':\s*\{/g;
  let m: RegExpExecArray | null;
  while ((m = keyRe.exec(src)) !== null) {
    const start = m.index + m[0].lastIndexOf('{');
    let depth = 0;
    let j = start;
    while (j < src.length) {
      if (src[j] === '{') depth++;
      else if (src[j] === '}') {
        depth--;
        if (depth === 0) break;
      }
      j++;
    }
    out.push({ key: m[1]!, block: src.slice(start + 1, j) });
  }
  return out;
}

function valueOf(block: string, label: 'ar' | 'en'): string | null {
  const i = block.indexOf(label + ':');
  if (i < 0) return null;
  const q1 = block.indexOf("'", i);
  const q2 = block.indexOf('"', i);
  const q = q1 >= 0 && (q2 < 0 || q1 < q2) ? q1 : q2;
  if (q < 0) return null;
  const quote = block[q]!;
  let j = q + 1;
  let out = '';
  while (j < block.length) {
    const ch = block[j];
    if (ch === '\\' && j + 1 < block.length) {
      out += block[j + 1];
      j += 2;
      continue;
    }
    if (ch === quote) break;
    out += ch;
    j++;
  }
  return out;
}

describe('i18n catalog integrity (S3 regression)', () => {
  it('every catalog key has ar and en values', () => {
    const files = globSync(fileURLToPath(new URL('./i18n/messages/**/*.ts', import.meta.url)));
    expect(files.length).toBeGreaterThan(10);
    let total = 0;
    for (const file of files) {
      const src = readFileSync(file, 'utf-8');
      for (const { key, block } of collectBlocks(src)) {
        total++;
        expect(valueOf(block, 'ar'), `${key} missing ar in ${file}`).not.toBeNull();
        expect(valueOf(block, 'en'), `${key} missing en in ${file}`).not.toBeNull();
      }
    }
    expect(total).toBeGreaterThan(5000);
  });

  it('no ar/en value has leading or trailing spaces (S3 trim regression)', () => {
    const files = globSync(fileURLToPath(new URL('./i18n/messages/**/*.ts', import.meta.url)));
    for (const file of files) {
      const src = readFileSync(file, 'utf-8');
      for (const { key, block } of collectBlocks(src)) {
        for (const label of ['ar', 'en'] as const) {
          const v = valueOf(block, label);
          if (v === null) continue;
          expect(v, `${key}.${label} has leading/trailing space in ${file}`).toBe(v.trim());
        }
      }
    }
  });
});

describe('i18n catalog split invariants (per-platform bundling)', () => {
  it('web catalog contains no mobile.* keys', () => {
    const leaked = Object.keys(webMessages).filter((k) => k.startsWith('mobile.'));
    expect(leaked).toEqual([]);
  });

  it('every web catalog key also exists in the mobile catalog', () => {
    const missing = Object.keys(webMessages).filter((k) => !(k in mobileMessages));
    expect(missing).toEqual([]);
  });

  it('the merged union is structurally identical to the mobile union', () => {
    expect(Object.keys(sharedMessages).sort()).toEqual(Object.keys(mobileMessages).sort());
  });

  it('the web catalog is materially smaller than the mobile catalog', () => {
    // Architecture guard (not an exact-count trap — sweeps add keys weekly).
    expect(Object.keys(webMessages).length).toBeLessThan(Object.keys(mobileMessages).length - 3000);
  });
});

describe('buildBundleQuote', () => {
  it('computes progressive tiers from prices', () => {
    const quote = buildBundleQuote([100, 100, 100]);
    expect(quote.originalPrice).toBe(300);
    expect(quote.discountPct).toBeGreaterThanOrEqual(10);
    expect(quote.totalPrice).toBeLessThan(300);
  });

  it('throws for fewer than 3 services (tier floor)', () => {
    expect(() => buildBundleQuote([200, 100])).toThrow(/3\+ services/);
  });
});
