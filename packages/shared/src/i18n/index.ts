// ---------------------------------------------------------------------------
// Galaxy of Beauty — i18n Configuration
// ---------------------------------------------------------------------------
// Catalog split into per-domain modules under ./messages so parallel
// translation sweeps own disjoint files. Spread of `as const` literals
// preserves the strict TranslationKey union.

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
import { ar, en } from '../types';

export const defaultLocale = 'ar';
export const supportedLocales = ['ar', 'en'] as const;
export type Locale = (typeof supportedLocales)[number];

export function isRTL(locale: Locale): boolean {
  return locale === 'ar';
}

// ---- Translation catalog (merged) ----

export const sharedMessages = {
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
} as const;

export type TranslationKey = keyof typeof sharedMessages;

/**
 * Get a translated message. Falls back to the key if not found, and to
 * Arabic if the requested locale value is absent. Supports `{var}`
 * interpolation: t('x.hello', 'en', { name: 'Sara' }).
 */
export function t(
  key: TranslationKey,
  locale: Locale,
  vars?: Record<string, string | number>,
): string {
  const msg = sharedMessages[key];
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
