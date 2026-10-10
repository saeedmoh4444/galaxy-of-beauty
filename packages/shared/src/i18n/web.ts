// ---------------------------------------------------------------------------
// Web i18n entry — domain catalogs ONLY. This module is the single
// runtime import path for web bundles; it must never import a
// messages/mobile/* file (the leak guard in scripts/check-size-budgets.mjs
// enforces this).
//
// Locale split: the domain files stay the source of truth (`{ ar, en }`
// per key); scripts/generate-locale-catalogs.mjs flattens them into
// messages/generated/{en,ar}.ts. Runtime code loads the ACTIVE locale only
// via getWebCatalog() (dynamic import + promise cache — React use()-safe),
// so a route's first-load JS no longer ships both locales. Server-only
// components that need a synchronous t() import it from
// `@galaxy/shared/i18n/web-server` instead — never from this file.
// ---------------------------------------------------------------------------

import type { coreMessages } from './messages/core';
import type { navMessages } from './messages/nav';
import type { authMessages } from './messages/auth';
import type { bookingMessages } from './messages/booking';
import type { walletMessages } from './messages/wallet';
import type { profileMessages } from './messages/profile';
import type { adminMessages } from './messages/admin';
import type { marketingMessages } from './messages/marketing';
import type { uiMessages } from './messages/ui';
import type { miscMessages } from './messages/misc';
import type { bundlesMessages } from './messages/bundles';

import { defaultLocale, supportedLocales, isRTL, tFrom, localize, type Locale } from './runtime';

/** Strict web key union — what the server t() enforces. Derived from the
 * domain files via type-only imports, so importing this module pulls in
 * NO catalog values (types are erased). */
export type WebTranslationKey =
  | keyof typeof coreMessages
  | keyof typeof navMessages
  | keyof typeof authMessages
  | keyof typeof bookingMessages
  | keyof typeof walletMessages
  | keyof typeof profileMessages
  | keyof typeof adminMessages
  | keyof typeof marketingMessages
  | keyof typeof uiMessages
  | keyof typeof miscMessages
  | keyof typeof bundlesMessages;

/** Flat per-locale catalog (values only, keys shared). */
export type WebLocaleCatalog = Record<string, string>;

type CatalogLoader = () => Promise<WebLocaleCatalog>;

// Dynamic imports keep the non-active locale out of the first-load chunk
// graph — each loader resolves to its own async chunk.
const loaders: Record<Locale, CatalogLoader> = {
  en: () => import('./messages/generated/en').then((m) => m.enWebMessages),
  ar: () => import('./messages/generated/ar').then((m) => m.arWebMessages),
};

const catalogCache = new Map<Locale, Promise<WebLocaleCatalog>>();

/**
 * Cached per-locale catalog promise — stable identity per locale (safe for
 * React use()). SSR resolves it from disk; the client fetches the locale
 * chunk once and reuses it for the session.
 */
export function getWebCatalog(locale: Locale): Promise<WebLocaleCatalog> {
  let p = catalogCache.get(locale);
  if (!p) {
    p = loaders[locale]();
    catalogCache.set(locale, p);
  }
  return p;
}

export { defaultLocale, supportedLocales, isRTL, tFrom, localize };
export type { Locale };
