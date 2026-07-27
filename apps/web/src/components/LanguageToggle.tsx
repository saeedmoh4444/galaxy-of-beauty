'use client';

import { useRouter } from 'next/navigation';

const LOCALE_KEY = 'gob_lang';

function getStoredLocale(): string {
  if (typeof window === 'undefined') return 'ar';
  return localStorage.getItem(LOCALE_KEY) || 'ar';
}

function setStoredLocale(locale: string) {
  localStorage.setItem(LOCALE_KEY, locale);
  // Reload to apply RTL/LTR changes
  window.location.reload();
}

export function LanguageToggle(): JSX.Element {
  const current = getStoredLocale();

  return (
    <button
      onClick={() => setStoredLocale(current === 'ar' ? 'en' : 'ar')}
      className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
      title={current === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
    >
      <span>{current === 'ar' ? '🇸🇦 AR' : '🇬🇧 EN'}</span>
    </button>
  );
}
