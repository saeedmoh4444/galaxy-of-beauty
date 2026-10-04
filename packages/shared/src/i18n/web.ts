// ---------------------------------------------------------------------------
// Web i18n entry — domain catalogs ONLY. This module is the single
// runtime import path for web bundles; it must never import a
// messages/mobile/* file (the leak guard in scripts/check-size-budgets.mjs
// enforces this).
// ---------------------------------------------------------------------------

// Erased under verbatimModuleSyntax: keeps the legacy t() signature
// accepting the global union (rewards/page.tsx passes a global-typed
// variable), without pulling the merged catalog into the web graph.
import type { TranslationKey } from './index';

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

/** Strict web key union — what web t() should tighten to (see below). */
export type WebTranslationKey = keyof typeof webMessages;

/**
 * Web legacy t(): resolves against webMessages. The key parameter keeps
 * the GLOBAL union (type-only import above) so existing callers passing
 * TranslationKey-typed variables still compile; the strict union is
 * available as WebTranslationKey for opt-in tightening.
 */
export function t(
  key: TranslationKey,
  locale: Locale,
  vars?: Record<string, string | number>,
): string {
  return tFrom(webMessages as Record<string, Catalog>, key, locale, vars);
}

export { defaultLocale, supportedLocales, isRTL, tFrom, localize };
export type { Locale };
