'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { isRTL, t as tBase, type Locale, type TranslationKey } from '@galaxy/shared';
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

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      isRTL: isRTL(locale),
      t: (key: TranslationKey, vars?: Record<string, string | number>) => tBase(key, locale, vars),
      setLocale,
    }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
