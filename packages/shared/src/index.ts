// ── @galaxy/shared — Shared Constants, Types, i18n, Theme ──
// NO JSX — use @galaxy/ui for UI components and hooks.

// Constants
export * from './constants';

// Utils (pure functions, no JSX)
export { cn } from './utils/cn';
export { formatCurrency } from './utils/formatCurrency';
export { getSaudiSeason, getFridayBlockedHours } from './utils/saudiCalendar';

// Types
export type {
  ChildrenProps,
  AsyncState,
  FeatureComponentSet,
  Bilingual,
  BilingualContent,
  PaginatedResponse,
  ApiError,
} from './types/index';
export { ar, en } from './types/index';

// i18n
export { defaultLocale, supportedLocales, isRTL, sharedMessages, t } from './i18n';
export type { Locale, TranslationKey } from './i18n';

// Theme
export { colors, typography, spacing, borderRadius, shadows, breakpoints } from './theme';
export { default as theme } from './theme';
export type { Theme } from './theme';

// Images
export {
  serviceImages,
  categoryImages,
  heroImages,
  dashboardImages,
  getServiceImage,
  getCategoryImage,
} from './images';
