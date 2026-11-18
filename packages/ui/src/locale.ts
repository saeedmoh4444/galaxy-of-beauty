'use client';

/**
 * UI-package locale plumbing (W6-2 migration).
 *
 * The shared components carry bilingual {ar,en} data maps and read the
 * language from a `locale` prop that historically defaulted to 'ar' —
 * so English-locale users silently saw Arabic strings unless every
 * caller passed the prop. The apps now publish their active locale here
 * (their LocaleProviders call setUILocale), and the components' default
 * reads it per render, so the prop stays an explicit override.
 *
 * Defaults to 'ar' for SSR/first paint — the apps set the real locale
 * as soon as their provider mounts.
 */
let current: 'ar' | 'en' = 'ar';

export function setUILocale(locale: 'ar' | 'en'): void {
  current = locale;
}

export function getUILocale(): 'ar' | 'en' {
  return current;
}
