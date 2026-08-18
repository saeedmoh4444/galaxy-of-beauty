'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useLocale } from '@/components/LocaleProvider';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt(): JSX.Element {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const { t } = useLocale();

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!deferredPrompt || dismissed) return <></>;

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
    setDismissed(true);
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-sm rounded-2xl bg-white p-4 shadow-2xl border border-brand-200 dark:bg-gray-900 dark:border-brand-800 animate-slide-up">
      <div className="flex items-center gap-4">
        <Image
          src="/logo.png"
          alt={t('common.brandName')}
          width={48}
          height={48}
          className="h-12 w-12 rounded-xl"
        />
        <div className="flex-1">
          <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">
            {t('pwa.install-title')}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{t('pwa.install-desc')}</p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={install}
          className="flex-1 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          {t('pwa.install')}
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {t('pwa.later')}
        </button>
      </div>
    </div>
  );
}
