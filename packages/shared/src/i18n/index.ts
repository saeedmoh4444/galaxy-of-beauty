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
import { webMessages } from './web';
import { mobileMessages } from './mobile';

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
export { webMessages, mobileMessages };
