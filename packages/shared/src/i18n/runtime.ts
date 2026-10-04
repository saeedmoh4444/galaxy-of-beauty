// ---------------------------------------------------------------------------
// i18n runtime — catalog-independent infrastructure shared by the web and
// mobile entry points (and the merged legacy module). This file must NOT
// import any catalog message file, so importing it never pulls keys into
// a bundle.
// ---------------------------------------------------------------------------

import { ar, en } from '../types';

export const defaultLocale = 'ar';
export const supportedLocales = ['ar', 'en'] as const;
export type Locale = (typeof supportedLocales)[number];

export function isRTL(locale: Locale): boolean {
  return locale === 'ar';
}

export type Catalog = { ar: string; en: string };

/**
 * Resolve a key against a catalog. Falls back to the key if not found,
 * and to Arabic if the requested locale value is absent. Supports
 * `{var}` interpolation: tFrom(catalog, 'x.hello', 'en', { name: 'Sara' }).
 * The key parameter is deliberately `string` — catalog-agnostic; each
 * platform's `t()` wrapper applies its own key-union strictness.
 */
export function tFrom(
  catalog: Record<string, Catalog>,
  key: string,
  locale: Locale,
  vars?: Record<string, string | number>,
): string {
  const msg = catalog[key];
  if (!msg) return key;
  let s: string = msg[locale] ?? msg.ar;
  if (vars) {
    s = s.replace(/\{(\w+)\}/g, (match, k: string) => (vars[k] != null ? String(vars[k]) : match));
  }
  return s;
}

/** Pick the right language out of a bilingual { ar, en } JSONB field. */
export function localize(json: unknown, locale: Locale): string {
  return locale === 'en' ? en(json) : ar(json);
}
