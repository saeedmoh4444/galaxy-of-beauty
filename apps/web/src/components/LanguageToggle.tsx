'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const LOCALE_COOKIE = 'gob_lang';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match?.[1] ?? null;
}

function setCookie(name: string, value: string): void {
  document.cookie = `${name}=${value}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function LanguageToggle(): JSX.Element {
  const router = useRouter();
  const [current, setCurrent] = useState('ar');

  useEffect(() => {
    setCurrent(getCookie(LOCALE_COOKIE) || 'ar');
  }, []);

  const toggle = useCallback(() => {
    const next = current === 'ar' ? 'en' : 'ar';
    setCookie(LOCALE_COOKIE, next);
    setCurrent(next);
    // Soft refresh via router — no hard reload needed
    router.refresh();
  }, [current, router]);

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
      title={current === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
      aria-label={current === 'ar' ? 'Switch to English' : 'Switch to Arabic'}
    >
      <span>{current === 'ar' ? ' AR' : ' EN'}</span>
    </button>
  );
}
