'use client';
import type { JSX } from 'react';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import type { Locale } from '@galaxy/shared';
import { LOCALE_CHANGE_EVENT } from '@/components/LocaleProvider';
import { useCatalogT } from '@/components/use-catalog-t';

/**
 * W4-11 — group-level error boundary. Renders inside a route group's
 * error.tsx so a crash in one area shows a localized, retryable fallback
 * instead of unmounting the whole app through the root boundary.
 * Provider-independent (same locale source as the root error page).
 * The raw error.message is NEVER rendered (W4-13) — it goes to the
 * console/Sentry only.
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

export function GroupError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): JSX.Element {
  return (
    <Suspense fallback={null}>
      <GroupErrorInner error={error} reset={reset} />
    </Suspense>
  );
}

function GroupErrorInner({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): JSX.Element {
  const locale = usePageLocale();
  const t = useCatalogT(locale);

  useEffect(() => {
    console.error('[GroupError]', error.digest ?? error.message);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center bg-surface-elevated px-4 py-10">
      <h1 className="text-xl font-bold text-text-primary">{t('error.unexpected')}</h1>
      <p className="mt-2 max-w-md text-center text-sm text-text-secondary">
        {t('error.try-again-support')}
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          {t('button.retry')}
        </button>
        <Link
          href="/"
          className="rounded-xl border border-edge px-6 py-3 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-muted dark:hover:bg-gray-800"
        >
          {t('common.back-home')}
        </Link>
      </div>
    </div>
  );
}
