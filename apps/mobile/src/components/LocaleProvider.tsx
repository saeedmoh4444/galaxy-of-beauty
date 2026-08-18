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
import { loadStoredLocale, persistLocale } from '@/lib/locale';

interface LocaleContextValue {
  locale: Locale;
  isRTL: boolean;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  setLocale: (next: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }): JSX.Element {
  const [locale, setLocaleState] = useState<Locale>('ar');

  // Restore the persisted preference (AsyncStorage) after mount. The app
  // splash covers the cold start, so the brief Arabic default is hidden.
  useEffect(() => {
    void loadStoredLocale().then((stored) => {
      if (stored) setLocaleState(stored);
    });
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    void persistLocale(next);
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
