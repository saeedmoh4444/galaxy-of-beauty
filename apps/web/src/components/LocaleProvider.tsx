'use client';

import {
  createContext,
  Suspense,
  use,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { JSX } from 'react';
import {
  getWebCatalog,
  isRTL,
  tFrom,
  type Locale,
  type TranslationKey,
  type WebLocaleCatalog,
} from '@galaxy/shared';
import { LOCALE_COOKIE } from '@/lib/locale';

export const LOCALE_CHANGE_EVENT = 'gob:locale-change';

const COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

interface LocaleContextValue {
  locale: Locale;
  isRTL: boolean;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  setLocale: (next: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

/** Internal raw context (locale + setter) — the public context is provided
 * by CatalogBridge below, which needs use() to load the active catalog. */
interface LocaleRawValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
}

const LocaleRawContext = createContext<LocaleRawValue | null>(null);

function useLocaleRaw(): LocaleRawValue {
  const ctx = useContext(LocaleRawContext);
  if (!ctx) throw new Error('useLocaleRaw must be used within LocaleProvider');
  return ctx;
}

/**
 * Bridges the raw locale state to the public t() context. Loads the ACTIVE
 * locale catalog only (getWebCatalog = cached dynamic import), so the
 * non-active locale stays out of the first-load chunk graph. Suspending
 * here is caught by the Suspense boundary in LocaleProvider — on first
 * locale switch per session a skeleton flashes briefly while the locale
 * chunk loads; subsequent switches are instant (cache).
 */
function CatalogBridge({ children }: { children: ReactNode }): JSX.Element {
  const { locale, setLocale } = useLocaleRaw();
  const catalog: WebLocaleCatalog = use(getWebCatalog(locale));

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      isRTL: isRTL(locale),
      t: (key: TranslationKey, vars?: Record<string, string | number>) =>
        tFrom(catalog, key, locale, vars),
      setLocale,
    }),
    [catalog, locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

/** Minimal skeleton while the locale catalog loads (first switch only). */
function LocaleSkeleton(): JSX.Element {
  return <div aria-hidden="true" className="min-h-screen" />;
}

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: ReactNode;
}): JSX.Element {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    document.cookie = `${LOCALE_COOKIE}=${next}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`;
    document.documentElement.lang = next;
    document.documentElement.dir = isRTL(next) ? 'rtl' : 'ltr';
    window.dispatchEvent(new CustomEvent(LOCALE_CHANGE_EVENT, { detail: { locale: next } }));
  }, []);

  // Keep this provider in sync with changes fired from anywhere
  // (LanguageToggle, profile language select, future code).
  useEffect(() => {
    const onChange = (e: Event) => {
      const next = (e as CustomEvent<{ locale?: Locale }>).detail?.locale;
      if (next === 'ar' || next === 'en') setLocaleState(next);
    };
    window.addEventListener(LOCALE_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(LOCALE_CHANGE_EVENT, onChange);
  }, []);

  // Prefetch the non-active locale after mount so the first manual switch
  // doesn't suspend (best-effort; failures are harmless).
  useEffect(() => {
    const other: Locale = locale === 'ar' ? 'en' : 'ar';
    let id: number | undefined;
    try {
      id = window.requestIdleCallback(() => {
        getWebCatalog(other).catch(() => {});
      });
    } catch {
      // browser without requestIdleCallback — skip the prefetch
    }
    return () => {
      if (id !== undefined) window.cancelIdleCallback(id);
    };
  }, [locale]);

  return (
    <LocaleRawContext.Provider value={{ locale, setLocale }}>
      <Suspense fallback={<LocaleSkeleton />}>
        <CatalogBridge>{children}</CatalogBridge>
      </Suspense>
    </LocaleRawContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
