'use client';

import { cn } from '@galaxy/shared';

const TIPS = [
  {
    emoji: '',
    title: { ar: 'نقاط النبض', en: 'Pulse points' },
    desc: { ar: 'المعصم، خلف الأذن، المرفق', en: 'Wrist, behind the ears, inner elbow' },
  },
  {
    emoji: '',
    title: { ar: 'رطبي أولاً', en: 'Moisturize first' },
    desc: { ar: 'البشرة المرطبة تثبت العطر أطول', en: 'Moisturized skin holds fragrance longer' },
  },
  {
    emoji: '',
    title: { ar: 'لا تفركي', en: 'Do not rub' },
    desc: { ar: 'الفرك يكسر جزيئات العطر', en: 'Rubbing breaks down fragrance molecules' },
  },
  {
    emoji: '️',
    title: { ar: 'تخزين صحيح', en: 'Proper storage' },
    desc: { ar: 'مكان بارد ومظلم — ليس الحمام', en: 'A cool, dark place — not the bathroom' },
  },
];

interface BeautyPerfumeCardProps {
  className?: string;
  title?: string;
  subtitle?: string;
  locale?: 'ar' | 'en';
}

export function BeautyPerfumeCard({
  className = '',
  title = 'أسرار العطر',
  subtitle = 'كيف تجعلين عطرك يدوم',
  locale = 'ar',
}: BeautyPerfumeCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-fuchsia-100 bg-white p-4 dark:border-fuchsia-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-fuchsia-700 dark:text-fuchsia-300">{title}</h4>
          <p className="text-[10px] text-fuchsia-500 dark:text-fuchsia-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {TIPS.map((t) => (
          <div
            key={t.title.ar}
            className="rounded-lg bg-fuchsia-50 px-2.5 py-2 dark:bg-fuchsia-950"
          >
            <span className="text-sm">{t.emoji}</span>
            <p className="mt-0.5 text-[10px] font-bold text-fuchsia-800 dark:text-fuchsia-200">
              {t.title[locale]}
            </p>
            <p className="text-[9px] text-fuchsia-600 dark:text-fuchsia-400">{t.desc[locale]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
