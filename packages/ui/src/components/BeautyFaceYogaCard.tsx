'use client';
import { cn } from '@galaxy/shared';
export function BeautyFaceYogaCard({
  className = '',
  title = 'يوغا الوجه',
  subtitle = 'تمارين لشد الوجه طبيعياً',
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
        'rounded-2xl border border-brand-100 bg-white p-4 dark:border-brand-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-brand-700 dark:text-brand-300">{title}</h4>
          <p className="text-[10px] text-brand-500 dark:text-brand-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'تمرين O —— افتحي فمكِ 5 ثوانٍ — 10 مرات',
              en: 'Exercise O — open your mouth for 5 seconds — 10 times',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'تمرين القبلة —— مدي شفاهكِ للأمام — 10 مرات',
              en: 'Kiss exercise — pucker your lips forward — 10 times',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'رفع الخدود —— ابتسمي بدون عيون — 15 مرة',
              en: 'Cheek lift — smile with your eyes closed — 15 times',
            },
          },
          {
            emoji: '️',
            text: {
              ar: '5 دقائق يومياً — نتائج بعد 4-6 أسابيع',
              en: '5 minutes daily — results in 4-6 weeks',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2 dark:bg-brand-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-brand-800 dark:text-brand-200">{t.text[locale]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
