'use client';

import { cn } from '@galaxy/shared';

const TIPS = [
  {
    emoji: '',
    title: { ar: 'الترطيب أولاً', en: 'Moisturize first' },
    desc: {
      ar: 'بشرة مرطبة = مكياج أجمل وأثبت',
      en: 'Hydrated skin = smoother, longer-lasting makeup',
    },
  },
  {
    emoji: '️',
    title: { ar: 'نظفي فرشك', en: 'Clean your brushes' },
    desc: { ar: 'أسبوعياً — البكتيريا تتراكم', en: 'Weekly — bacteria builds up' },
  },
  {
    emoji: '',
    title: { ar: 'تاريخ الصلاحية', en: 'Check expiry dates' },
    desc: { ar: 'جددِي مكياجك كل 6-12 شهر', en: 'Replace your makeup every 6-12 months' },
  },
  {
    emoji: '',
    title: { ar: 'أزيلي المكياج', en: 'Remove your makeup' },
    desc: { ar: 'لا تنامي أبداً بالمكياج', en: 'Never sleep with makeup on' },
  },
];

interface BeautyMakeupTipsCardProps {
  className?: string;
  heading?: string;
  subtitle?: string;
  locale?: 'ar' | 'en';
}

export function BeautyMakeupTipsCard({
  className = '',
  heading = 'نصائح المكياج',
  subtitle = 'لإطلالة تدوم طويلاً',
  locale = 'ar',
}: BeautyMakeupTipsCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-rose-100 bg-white p-4 dark:border-rose-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-rose-700 dark:text-rose-300">{heading}</h4>
          <p className="text-[10px] text-rose-500 dark:text-rose-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        {TIPS.map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 dark:bg-rose-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <div>
              <p className="text-[10px] font-bold text-rose-800 dark:text-rose-200">
                {t.title[locale]}
              </p>
              <p className="text-[9px] text-rose-600 dark:text-rose-400">{t.desc[locale]}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
