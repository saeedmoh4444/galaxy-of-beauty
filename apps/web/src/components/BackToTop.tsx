'use client';

import { useState, useEffect } from 'react';
import { useLocale } from '@/components/LocaleProvider';

export function BackToTop(): JSX.Element {
  const [visible, setVisible] = useState(false);
  const { t } = useLocale();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return <></>;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition-all hover:bg-brand-700 hover:scale-110"
      aria-label={t('common.back-to-top')}
    >
      ↑
    </button>
  );
}
