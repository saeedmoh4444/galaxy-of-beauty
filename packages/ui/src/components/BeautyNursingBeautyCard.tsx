'use client';
import { cn } from '@galaxy/shared';
export function BeautyNursingBeautyCard({
  className = '',
  title = 'جمال المرضعة',
  subtitle = 'عناية آمنة أثناء الرضاعة',
  locale = 'ar',
}: {
  className?: string;
  title?: string;
  subtitle?: string;
  locale?: 'ar' | 'en';
}): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-teal-100 bg-white p-4 dark:border-teal-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-teal-700 dark:text-teal-300">{title}</h4>
          <p className="text-[10px] text-teal-500 dark:text-teal-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'اشربي ماء أكثر — الرضاعة تجفف الجسم',
              en: 'Drink more water — breastfeeding dehydrates the body',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'كريمات آمنة — بدون ريتينول أو ساليسيليك',
              en: 'Safe creams — no retinol or salicylic acid',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'شعركِ قد يتساقط — فيتامينات ومكملات',
              en: 'Your hair may shed — vitamins and supplements',
            },
          },
          {
            emoji: '️',
            text: { ar: 'روتين سريع — 5 دقائق تكفي', en: 'A quick routine — 5 minutes is enough' },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-teal-50 px-3 py-2 dark:bg-teal-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-teal-800 dark:text-teal-200">{t.text[locale]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
