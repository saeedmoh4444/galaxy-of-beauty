import { createHash } from 'node:crypto';

/**
 * D3 — typed cache-key builders for the hot catalog reads.
 *
 * Keys are deterministic (stable serialization — JSON key order does not
 * matter) and namespaced under `catalog:<family>:` so mutations invalidate
 * whole families with one prefix (services edits also clear bundles, whose
 * payloads embed service rows).
 */

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(',')}}`;
}

function listKey(family: string, input: unknown): string {
  const digest = createHash('sha256')
    .update(stableStringify(input ?? {}))
    .digest('hex')
    .slice(0, 16);
  return `catalog:${family}:list:${digest}`;
}

export const catalogCache = {
  services: {
    prefix: 'catalog:services:',
    list: (input: unknown) => listKey('services', input),
  },
  bundles: {
    prefix: 'catalog:bundles:',
    list: () => 'catalog:bundles:list',
  },
  technicians: {
    prefix: 'catalog:technicians:',
    list: (input: unknown) => listKey('technicians', input),
  },
} as const;
