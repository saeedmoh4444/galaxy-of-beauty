// ---------------------------------------------------------------------------
// SERVER-ONLY sync t() — statically imports BOTH locale catalogs, so it
// belongs in server components / server utilities only (the server bundle
// graph). Importing this from a client component re-bundles both locales
// into the client first-load — the locale guard in
// scripts/check-size-budgets.mjs fails the build if that ever happens.
// Client code uses getWebCatalog() via useLocale()/useCatalogT() instead.
// ---------------------------------------------------------------------------

import { enWebMessages } from './messages/generated/en';
import { arWebMessages } from './messages/generated/ar';
import { tFrom, type Locale } from './runtime';
import type { WebTranslationKey } from './web';

const byLocale: Record<Locale, Record<string, string>> = {
  en: enWebMessages,
  ar: arWebMessages,
};

/**
 * Web server t(): resolves synchronously against the active locale and
 * only accepts web keys — a mobile.* key is a compile error here
 * (useLocale's t keeps the global union for dynamic-key call sites).
 */
export function t(
  key: WebTranslationKey,
  locale: Locale,
  vars?: Record<string, string | number>,
): string {
  return tFrom(byLocale[locale], key, locale, vars);
}

export type { WebTranslationKey, Locale };
