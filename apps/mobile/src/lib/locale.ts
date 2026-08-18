/**
 * Mobile locale persistence — AsyncStorage-backed (mobile has no
 * cookies). Exposes the storage key + read/write helpers used by the
 * LocaleProvider.
 *
 * AsyncStorage is an optional dependency in this repo — loaded
 * dynamically (same pattern as lib/authToken.ts) with an in-memory
 * fallback so web builds don't break.
 */

export const LOCALE_STORAGE_KEY = 'gob_lang';

// In-memory fallback for platforms without the native module.
const memoryStore = new Map<string, string>();

function storage(): {
  getItem: (k: string) => Promise<string | null>;
  setItem: (k: string, v: string) => Promise<void>;
} {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- optional dependency, dynamic require with fallback
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return {
      getItem: (k: string) => AsyncStorage.getItem(k),
      setItem: (k: string, v: string) => AsyncStorage.setItem(k, v),
    };
  } catch {
    return {
      getItem: async (k: string) => memoryStore.get(k) ?? null,
      setItem: async (k: string, v: string) => {
        memoryStore.set(k, v);
      },
    };
  }
}

export async function loadStoredLocale(): Promise<'ar' | 'en' | null> {
  try {
    const value = await storage().getItem(LOCALE_STORAGE_KEY);
    return value === 'en' ? 'en' : value === 'ar' ? 'ar' : null;
  } catch {
    return null;
  }
}

export async function persistLocale(locale: 'ar' | 'en'): Promise<void> {
  try {
    await storage().setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Non-fatal — locale falls back to Arabic next launch.
  }
}
