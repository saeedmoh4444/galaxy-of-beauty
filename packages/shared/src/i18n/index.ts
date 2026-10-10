// ---------------------------------------------------------------------------
// Galaxy of Beauty — merged i18n module (legacy entry).
// ---------------------------------------------------------------------------
// This module builds the FULL merged catalog (domain + mobile overlays)
// and is reachable ONLY via `@galaxy/shared/i18n-all` (the api i18n
// regression test). The apps import their platform entry instead:
//   web    → `@galaxy/shared` root barrel / `@galaxy/shared/i18n-web`
//   mobile → `@galaxy/shared/i18n-mobile`
// Nothing in the web graph may import this module at runtime (erased
// type-only imports are fine) — scripts/check-size-budgets.mjs guards it.

import {
  defaultLocale,
  supportedLocales,
  isRTL,
  tFrom,
  localize,
  type Catalog,
  type Locale,
} from './runtime';
// webMessages is rebuilt here from the domain files (NOT imported from
// ./web anymore): this merged module exists for the i18n regression tests
// and the erased TranslationKey union, so it must keep the literal spread
// that preserves keyof typing. Runtime web bundles load the per-locale
// generated catalogs instead — the drift test in
// scripts/check-locale-catalogs.test.mjs keeps them in sync with these
// sources.
import { coreMessages } from './messages/core';
import { navMessages } from './messages/nav';
import { authMessages } from './messages/auth';
import { bookingMessages } from './messages/booking';
import { walletMessages } from './messages/wallet';
import { profileMessages } from './messages/profile';
import { adminMessages } from './messages/admin';
import { marketingMessages } from './messages/marketing';
import { uiMessages } from './messages/ui';
import { miscMessages } from './messages/misc';
import { bundlesMessages } from './messages/bundles';
import { mobileMessages } from './mobile';

export const webMessages = {
  ...coreMessages,
  ...navMessages,
  ...authMessages,
  ...bookingMessages,
  ...walletMessages,
  ...profileMessages,
  ...adminMessages,
  ...marketingMessages,
  ...uiMessages,
  ...miscMessages,
  ...bundlesMessages,
} as const;

export const sharedMessages = {
  ...webMessages,
  ...mobileMessages,
} as const;

export type TranslationKey = keyof typeof sharedMessages;

/**
 * Get a translated message from the merged (mobile-overlay) catalog.
 * Kept for backward compatibility; new call sites should use tFrom with
 * the platform catalog (webMessages / mobileMessages).
 */
export function t(
  key: TranslationKey,
  locale: Locale,
  vars?: Record<string, string | number>,
): string {
  return tFrom(sharedMessages as Record<string, Catalog>, key, locale, vars);
}

export { defaultLocale, supportedLocales, isRTL, tFrom, localize };
export type { Locale };
export { mobileMessages };
