// ---------------------------------------------------------------------------
// Mobile i18n entry — domain catalogs + mobile overlays. Reachable only
// via `@galaxy/shared/i18n-mobile`; web bundles never import this module.
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
import { mobileCoreMessages } from './messages/mobile/core';
import { mobileAuthMessages } from './messages/mobile/auth';
import { mobileCustomerMessages } from './messages/mobile/customer';
import { mobileCustomerAMessages } from './messages/mobile/customerA';
import { mobileCustomerBMessages } from './messages/mobile/customerB';
import { mobileTechMessages } from './messages/mobile/tech';
import { mobileAdminMessages } from './messages/mobile/admin';
import { mobilePublicMessages } from './messages/mobile/public';

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

// TS7056 guard: the merged catalog's INFERRED literal type outgrew the
// compiler's serialization limit, so the key union is derived from the
// SOURCE files (each keyof serializes fine) and the merged value gets an
// explicit annotation instead of inference.
type DomainKey = keyof typeof domainMessages;
type MobileOverlayKey =
  | keyof typeof mobileCoreMessages
  | keyof typeof mobileAuthMessages
  | keyof typeof mobileCustomerMessages
  | keyof typeof mobileCustomerAMessages
  | keyof typeof mobileCustomerBMessages
  | keyof typeof mobileTechMessages
  | keyof typeof mobileAdminMessages
  | keyof typeof mobilePublicMessages;

export type TranslationKey = DomainKey | MobileOverlayKey;

export const mobileMessages: Record<TranslationKey, Catalog | string> = {
  ...domainMessages,
  ...mobileCoreMessages,
  ...mobileAuthMessages,
  ...mobileCustomerMessages,
  ...mobileCustomerAMessages,
  ...mobileCustomerBMessages,
  ...mobileTechMessages,
  ...mobileAdminMessages,
  ...mobilePublicMessages,
};

export function t(
  key: TranslationKey,
  locale: Locale,
  vars?: Record<string, string | number>,
): string {
  return tFrom(mobileMessages as Record<string, Catalog>, key, locale, vars);
}

export { defaultLocale, supportedLocales, isRTL, tFrom, localize };
export type { Locale };
