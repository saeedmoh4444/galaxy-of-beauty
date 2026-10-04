// ---------------------------------------------------------------------------
// Web i18n entry — domain catalogs ONLY. This module is the single
// runtime import path for web bundles; it must never import a
// messages/mobile/* file (the leak guard in scripts/check-size-budgets.mjs
// enforces this).
// ---------------------------------------------------------------------------

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

import {
  defaultLocale,
  supportedLocales,
  isRTL,
  tFrom,
  localize,
  type Catalog,
  type Locale,
} from './runtime';

const domainMessages = {
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
};

export const webMessages = {
  ...domainMessages,
} as const;

/** Strict web key union — what web t() now enforces. */
export type WebTranslationKey = keyof typeof webMessages;

/**
 * Web legacy t(): resolves against webMessages and only accepts web
 * keys — a mobile.* key is a compile error here (useLocale's t keeps
 * the global union for dynamic-key call sites).
 */
export function t(
  key: WebTranslationKey,
  locale: Locale,
  vars?: Record<string, string | number>,
): string {
  return tFrom(webMessages as Record<string, Catalog>, key, locale, vars);
}

export { defaultLocale, supportedLocales, isRTL, tFrom, localize };
export type { Locale };
