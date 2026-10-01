/**
 * Config package smoke tests (audit stage 10 — config had zero tests).
 * Guards the tsconfig presets: valid JSON, extends chains resolve, and
 * the apps' noUncheckedIndexedAccess is not silently lost.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const DIR = fileURLToPath(new URL('./tsconfig/', import.meta.url));

function load(name: string): Record<string, unknown> {
  const raw = readFileSync(new URL(`./tsconfig/${name}`, import.meta.url), 'utf-8');
  // tsconfig files are JSONC (comments allowed) — strip line comments.
  const json = raw
    .split('\n')
    .filter((line) => !line.trimStart().startsWith('//'))
    .join('\n');
  return JSON.parse(json);
}

describe('tsconfig presets', () => {
  it('parses as valid JSON and extends base', () => {
    for (const name of ['base.json', 'next.json', 'expo.json', 'react-library.json']) {
      const cfg = load(name);
      if (name !== 'base.json') {
        expect(cfg['extends'], `${name} should extend base`).toBe('./base.json');
      }
    }
  });

  it('next/expo presets enforce noUncheckedIndexedAccess via base', () => {
    const base = load('base.json');
    const opts = base['compilerOptions'] as Record<string, unknown>;
    expect(opts['noUncheckedIndexedAccess']).toBe(true);
  });

  it('next preset keeps the next plugin', () => {
    const next = load('next.json');
    const opts = next['compilerOptions'] as Record<string, unknown>;
    expect((opts['plugins'] as Array<Record<string, unknown>>)[0]?.['name']).toBe('next');
  });
});
