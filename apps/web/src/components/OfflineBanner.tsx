'use client';

import { useState, useEffect } from 'react';
import type { Locale } from '@galaxy/shared';
import { t } from '@galaxy/shared';
import { LOCALE_CHANGE_EVENT } from '@/components/LocaleProvider';

/**
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

export function OfflineBanner(): JSX.Element | null {
  const [offline, setOffline] = useState(false);
  const locale = usePageLocale();

  useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    setOffline(!navigator.onLine);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="sticky top-0 z-50 bg-amber-500 px-4 py-2 text-center text-sm font-medium text-white">
      {t('state.offline-banner', locale)}
    </div>
  );
}
