'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Locale } from '@galaxy/shared';
import { t } from '@galaxy/shared';
import { LOCALE_CHANGE_EVENT } from '@/components/LocaleProvider';

/**
 * Route-level error page. May render without the LocaleProvider (if the
 * provider itself crashed), so the locale is read from <html lang> — which
 * the server sets and setLocale keeps in sync.
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

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): JSX.Element {
  const locale = usePageLocale();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 dark:bg-gray-950">
      <Image
        src="/logo.png"
        alt={t('common.brandName', locale)}
        width={80}
        height={80}
        className="mb-8 h-20 w-20 rounded-2xl object-cover shadow-lg"
      />
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {t('error.unexpected', locale)}
      </h1>
      <p className="mt-2 max-w-md text-center text-sm text-gray-500 dark:text-gray-400">
        {error.message || t('error.try-again-support', locale)}
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          {t('button.retry', locale)}
        </button>
        <Link
          href="/"
          className="rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          {t('common.back-home', locale)}
        </Link>
      </div>
    </div>
  );
}
