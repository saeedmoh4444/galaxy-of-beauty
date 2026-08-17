'use client';

import { useRouter } from 'next/navigation';
import { useLocale } from '@/components/LocaleProvider';

export function LanguageToggle(): JSX.Element {
  const router = useRouter();
  const { locale, setLocale } = useLocale();
  const next = locale === 'ar' ? 'en' : 'ar';

  const toggle = () => {
    // Context change re-renders every useLocale() consumer instantly;
    // router.refresh() re-runs the server tree (root layout re-reads the
    // cookie and re-emits <html lang/dir> for the next paint).
    setLocale(next);
    router.refresh();
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
      title={locale === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
      aria-label={locale === 'ar' ? 'Switch to English' : 'Switch to Arabic'}
    >
      <span>{locale === 'ar' ? ' AR' : ' EN'}</span>
    </button>
  );
}
