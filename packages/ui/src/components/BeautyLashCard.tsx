'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Lash Card — eyelash care & extension tips.
 * From Phase W6: Education & Empowerment.
 */

interface BeautyLashCardProps {
  className?: string;
  heading?: string;
  subtitle?: string;
  locale?: 'ar' | 'en';
}

export function BeautyLashCard({
  className = '',
  heading = 'عناية بالرموش',
  subtitle = 'رموش كثيفة وصحية',
  locale = 'ar',
}: BeautyLashCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-purple-100 bg-white p-4 dark:border-purple-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">️</span>
        <div>
          <h4 className="text-sm font-bold text-purple-700 dark:text-purple-300">{heading}</h4>
          <p className="text-[10px] text-purple-500 dark:text-purple-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          {
            emoji: '',
            label: { ar: 'تنظيف لطيف', en: 'Gentle cleansing' },
            tip: { ar: 'مزيل مكياج خالٍ من الزيوت', en: 'Oil-free makeup remover' },
          },
          {
            emoji: '',
            label: { ar: 'زيت الخروع', en: 'Castor oil' },
            tip: { ar: 'يطبق ليلاً لتقوية الرموش', en: 'Apply at night to strengthen lashes' },
          },
          {
            emoji: '',
            label: { ar: 'لا تفركي', en: "Don't rub" },
            tip: { ar: 'الفرك يسبب تساقط الرموش', en: 'Rubbing causes lash loss' },
          },
          {
            emoji: '',
            label: { ar: 'استراحة', en: 'Take breaks' },
            tip: { ar: 'خذي استراحة من الرموش الصناعية', en: 'Take breaks from false lashes' },
          },
        ].map((t) => (
          <div key={t.label.ar} className="rounded-lg bg-purple-50 px-2.5 py-2 dark:bg-purple-950">
            <span className="text-sm">{t.emoji}</span>
            <p className="mt-0.5 text-[10px] font-bold text-purple-800 dark:text-purple-200">
              {t.label[locale]}
            </p>
            <p className="text-[9px] text-purple-600 dark:text-purple-400">{t.tip[locale]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
