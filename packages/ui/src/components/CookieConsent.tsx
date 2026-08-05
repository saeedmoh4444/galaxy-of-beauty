'use client';

import { useState, useEffect } from 'react';

/**
 * Saudi PDPL-compliant cookie consent banner.
 * Shows on first visit, persists choice to localStorage.
 *
 * Usage: Add to root layout: <CookieConsent />
 */

export function CookieConsent(): JSX.Element | null {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consented = localStorage.getItem('gob_cookie_consent');
    if (!consented) setVisible(true);
  }, []);

  const accept = (level: 'all' | 'necessary') => {
    localStorage.setItem('gob_cookie_consent', JSON.stringify({ level, date: new Date().toISOString() }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-edge bg-white p-4 shadow-2xl dark:border-gray-700 dark:bg-gray-900 md:p-6" role="dialog" aria-label="سياسة ملفات تعريف الارتباط">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 text-sm text-text-secondary dark:text-gray-400">
          <p className="font-semibold text-text-primary dark:text-gray-100">🔒 خصوصيتك تهمنا</p>
          <p className="mt-1">
            نستخدم ملفات تعريف الارتباط لتحسين تجربتكِ على المنصة، وتحليل الاستخدام، وتقديم محتوى مخصص.
            بموافقتكِ، نلتزم بحماية بياناتكِ وفقاً لنظام حماية البيانات الشخصية السعودي (PDPL).
          </p>
          <a href="/terms" className="mt-1 inline-block text-xs text-brand-600 hover:underline dark:text-brand-400">
            معرفة المزيد عن سياسة الخصوصية
          </a>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => accept('necessary')}
            className="rounded-lg border border-edge px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-muted dark:border-gray-700 dark:hover:bg-gray-800"
          >
            الضرورية فقط
          </button>
          <button
            onClick={() => accept('all')}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            قبول الكل
          </button>
        </div>
      </div>
    </div>
  );
}
