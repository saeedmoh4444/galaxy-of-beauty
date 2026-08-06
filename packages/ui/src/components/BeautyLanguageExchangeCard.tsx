'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Language Exchange Card — learn beauty terms in different languages.
 * From Phase W4: Sisterhood & Community — Beauty Circles.
 *
 * Usage:
 *   <BeautyLanguageExchangeCard fromLang="ar" toLang="en" />
 */

interface Term { ar: string; en: string; emoji: string; }

const TERMS: Term[] = [
  { ar: 'مكياج', en: 'Makeup', emoji: '💄' },
  { ar: 'عناية بالبشرة', en: 'Skincare', emoji: '🧴' },
  { ar: 'حناء', en: 'Henna', emoji: '🤚' },
  { ar: 'عطر', en: 'Perfume', emoji: '🌸' },
  { ar: 'زيت', en: 'Oil', emoji: '🫒' },
  { ar: 'جمال', en: 'Beauty', emoji: '✨' },
];

interface BeautyLanguageExchangeCardProps {
  fromLang?: 'ar' | 'en';
  toLang?: 'ar' | 'en';
  className?: string;
}

export function BeautyLanguageExchangeCard({ fromLang = 'ar', toLang = 'en', className = '' }: BeautyLanguageExchangeCardProps): JSX.Element {
  const showAr = fromLang === 'ar';

  return (
    <div className={cn('rounded-2xl border border-teal-100 bg-white p-4 dark:border-teal-900 dark:bg-gray-900', className)}>
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true">🌐</span>
        <div>
          <h4 className="text-sm font-bold text-teal-700 dark:text-teal-300">قاموس الجمال</h4>
          <p className="text-[10px] text-teal-500 dark:text-teal-400">{fromLang === 'ar' ? '🇸🇦 عربي → 🇬🇧 English' : '🇬🇧 English → 🇸🇦 عربي'}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {TERMS.map((t) => (
          <div key={t.ar} className="flex items-center gap-2 rounded-lg bg-teal-50 px-2.5 py-2 dark:bg-teal-950">
            <span className="text-sm">{t.emoji}</span>
            <div>
              <p className="text-[10px] font-bold text-teal-800 dark:text-teal-200">{showAr ? t.ar : t.en}</p>
              <p className="text-[9px] text-teal-600 dark:text-teal-400">{showAr ? t.en : t.ar}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">🌐 الجمال لغة عالمية</p>
    </div>
  );
}
