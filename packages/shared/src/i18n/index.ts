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
import { mobileCoreMessages } from './messages/mobile/core';
import { mobileAuthMessages } from './messages/mobile/auth';
import { mobileCustomerMessages } from './messages/mobile/customer';
import { mobileCustomerAMessages } from './messages/mobile/customerA';
import { mobileCustomerBMessages } from './messages/mobile/customerB';
import { mobileTechMessages } from './messages/mobile/tech';
import { mobileAdminMessages } from './messages/mobile/admin';
import { mobilePublicMessages } from './messages/mobile/public';
import { ar, en } from '../types';

export const defaultLocale = 'ar';
export const supportedLocales = ['ar', 'en'] as const;
export type Locale = (typeof supportedLocales)[number];

export function isRTL(locale: Locale): boolean {
  return locale === 'ar';
}

// ---- Translation catalogs (per-platform) ----
// §2d fix: the single merged catalog let mobile files silently override
// web values on duplicate keys (38 AR collisions). Each platform now
// resolves its own catalog: web = domain files only; mobile = domain
// files + mobile overlays. sharedMessages remains the union so the
// TranslationKey type and legacy t() callers keep working.

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
};

export const webMessages = {
  ...domainMessages,
} as const;

export const mobileMessages = {
  ...domainMessages,
  ...mobileCoreMessages,
  ...mobileAuthMessages,
  ...mobileCustomerMessages,
  ...mobileCustomerAMessages,
  ...mobileCustomerBMessages,
  ...mobileTechMessages,
  ...mobileAdminMessages,
  ...mobilePublicMessages,
} as const;

export const sharedMessages = {
  ...webMessages,
  ...mobileMessages,
} as const;

export type TranslationKey = keyof typeof sharedMessages;

type Catalog = { ar: string; en: string };

/**
 * Resolve a key against a specific catalog (see tFrom). Falls back to the
 * key if not found, and to Arabic if the requested locale value is absent.
 * Supports `{var}` interpolation: t('x.hello', 'en', { name: 'Sara' }).
 */
export function tFrom(
  catalog: Record<string, Catalog>,
  key: TranslationKey,
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

/** Pick the right language out of a bilingual { ar, en } JSONB field. */
export function localize(json: unknown, locale: Locale): string {
  return locale === 'en' ? en(json) : ar(json);
}
