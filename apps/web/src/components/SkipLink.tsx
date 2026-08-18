'use client';

import { useState, useEffect } from 'react';
import type { Locale } from '@galaxy/shared';
import { t } from '@galaxy/shared';
import { LOCALE_CHANGE_EVENT } from '@/components/LocaleProvider';

/**
 * Skip-to-content link for keyboard navigation.
 * Visible on focus, hidden otherwise. Placed as the first focusable element.
 *
 * Rendered outside the LocaleProvider (root layout), so the locale is read
 * from <html lang> — which the server sets and setLocale keeps in sync.
 */
function usePageLocale(): Locale {
  const [locale, setLocale] = useState<Locale>('ar');
  useEffect(() => {
    const read = () => setLocale(document.documentElement.lang === 'en' ? 'en' : 'ar');
    read();
    window.addEventListener(LOCALE_CHANGE_EVENT, read as EventListener);
    return () => window.removeEventListener(LOCALE_CHANGE_EVENT, read as EventListener);
  }, []);
  return locale;
}

export function SkipLink(): JSX.Element {
  const locale = usePageLocale();

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-3 focus:text-sm focus:font-medium focus:text-white focus:shadow-lg focus:outline-none"
      aria-label={t('common.skip-to-content', locale)}
    >
      {t('common.skip-to-content', locale)}
    </a>
  );
}
