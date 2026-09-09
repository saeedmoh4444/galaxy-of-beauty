/**
 * Mobile theme system — light / dark / system.
 *
 * Resolves the effective theme from the stored preference (AsyncStorage,
 * key `gob_theme`) + the OS appearance (useColorScheme), and exposes it to
 * screens and shared components via useTheme().
 *
 * AsyncStorage is an optional dependency in this repo — loaded dynamically
 * (same pattern as lib/locale.ts) with an in-memory fallback so web builds
 * don't break.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  bg: string;
  surface: string;
  text: string;
  textSecondary: string;
  brand: string;
  border: string;
  danger: string;
  success: string;
}

/** Web-palette-aligned theme colors — Rose Blush direction (2026-09-09). */
export const themeColors: Record<'light' | 'dark', ThemeColors> = {
  light: {
    bg: '#fdf9f7',
    surface: '#ffffff',
    text: '#2d1b22',
    textSecondary: '#8a6e78',
    brand: '#c2255c',
    border: '#f0e4e8',
    danger: '#e5484d',
    success: '#059669',
  },
  dark: {
    bg: '#1f1418',
    surface: '#2e1f26',
    text: '#f7eef2',
    textSecondary: '#c9aeb9',
    brand: '#e268a0',
    border: '#3d2b32',
    danger: '#f87171',
    success: '#34d399',
  },
};

const THEME_STORAGE_KEY = 'gob_theme';

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

async function loadStoredTheme(): Promise<ThemeMode | null> {
  try {
    const value = await storage().getItem(THEME_STORAGE_KEY);
    return value === 'light' || value === 'dark' || value === 'system' ? value : null;
  } catch {
    return null;
  }
}

async function persistTheme(mode: ThemeMode): Promise<void> {
  try {
    await storage().setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // Non-fatal — theme falls back to system next launch.
  }
}

interface ThemeContextValue {
  isDark: boolean;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }): JSX.Element {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  // Restore the persisted preference (AsyncStorage) after mount. The app
  // splash covers the cold start, so the brief system-default is hidden.
  useEffect(() => {
    void loadStoredTheme().then((stored) => {
      if (stored) setModeState(stored);
    });
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    void persistTheme(next);
  }, []);

  // 'system' resolves live against the OS appearance, so changing the OS
  // theme while the app runs re-renders immediately.
  const isDark = mode === 'dark' || (mode === 'system' && systemScheme === 'dark');

  const value = useMemo<ThemeContextValue>(
    () => ({ isDark, mode, setMode }),
    [isDark, mode, setMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
