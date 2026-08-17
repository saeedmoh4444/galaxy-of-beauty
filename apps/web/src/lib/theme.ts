/**
 * Theme helpers — apply/read the dark mode class on <html> and sync
 * every mounted ThemeToggle via a window event.
 */

const THEME_STORAGE_KEY = 'theme';
export const THEME_CHANGE_EVENT = 'gob:theme-change';

export function readStoredTheme(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'dark') return true;
  if (stored === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function applyTheme(dark: boolean): void {
  document.documentElement.classList.toggle('dark', dark);
  localStorage.setItem(THEME_STORAGE_KEY, dark ? 'dark' : 'light');
  window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: { dark } }));
}

/** True when the dark class is currently applied (post-hydration only). */
export function isDarkApplied(): boolean {
  return document.documentElement.classList.contains('dark');
}
