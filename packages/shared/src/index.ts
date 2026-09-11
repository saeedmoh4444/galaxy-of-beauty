// ── @galaxy/shared — Shared Constants, Types, i18n, Theme ──
// NO JSX — use @galaxy/ui for UI components and hooks.

// Constants
export * from './constants';

// E4a — cycle phases, predictions, symptoms, PMS library (shared by the
// cycleTracker + wellnessHub routers).
export * from './cycle';

// E4b — breathing/meditation/journaling/nutrition libraries (wellnessContent).
export * from './wellness';

// E6a — life-stage journey definitions + pamper window math.
export * from './lifeStage';

// E6b — postpartum care content library (healing phases, tips, signals).
export * from './postpartum';

// E6c — menopause/perimenopause content, symptoms and phase math.
export * from './menopause';

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
export { defaultLocale, supportedLocales, isRTL, localize, sharedMessages, t } from './i18n';
export type { Locale, TranslationKey } from './i18n';

// Theme
export { colors, typography, spacing, borderRadius, shadows, breakpoints } from './theme';
export { default as theme } from './theme';
export type { Theme } from './theme';

// Wellness hub tabs (Phase 3 sprint 3)
export { WELLNESS_TABS, WELLNESS_TAB_I18N, defaultTabFor, isWellnessTabKey } from './wellnessTabs';
export type { WellnessTabKey, WellnessTabInput } from './wellnessTabs';

// Images
export {
  serviceImages,
  categoryImages,
  heroImages,
  dashboardImages,
  getServiceImage,
  getCategoryImage,
  serviceKeyFromCategorySlug,
  womensCategoryImageKey,
} from './images';
