'use client';

import { cn } from '@galaxy/shared';

interface BeautyBreathingCardProps {
  className?: string;
  locale?: 'ar' | 'en';
  title?: string;
  subtitle?: string;
  footerText?: string;
}

export function BeautyBreathingCard({
  className = '',
  locale = 'ar',
  title = 'تنفس الجمال',
  subtitle = 'تقنية 4-7-8 للاسترخاء',
  footerText = '🫁 التنفس العميق = بشرة مشرقة + عقل هادئ',
}: BeautyBreathingCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-blue-50 p-5 dark:border-sky-900 dark:from-sky-950 dark:to-blue-950',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-3xl">🫁</span>
        <h4 className="mt-1 text-sm font-bold text-sky-800 dark:text-sky-200">{title}</h4>
        <p className="text-[10px] text-sky-500 dark:text-sky-400">{subtitle}</p>
      </div>
      <div className="mt-3 space-y-2">
        {[
          {
            emoji: '🫁',
            step: { ar: 'شهيق من الأنف', en: 'Inhale through nose' },
            count: { ar: '4 ثوانٍ', en: '4 seconds' },
          },
          {
            emoji: '',
            step: { ar: 'احبسي النفس', en: 'Hold your breath' },
            count: { ar: '7 ثوانٍ', en: '7 seconds' },
          },
          {
            emoji: '',
            step: { ar: 'زفير من الفم', en: 'Exhale through mouth' },
            count: { ar: '8 ثوانٍ', en: '8 seconds' },
          },
          {
            emoji: '',
            step: { ar: 'كرري 4 مرات', en: 'Repeat 4 times' },
            count: { ar: 'دقيقتان', en: '2 minutes' },
          },
        ].map((s, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg bg-white/60 px-3 py-2.5 dark:bg-gray-800/60"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-200 text-[10px] font-bold text-sky-700 dark:bg-sky-800 dark:text-sky-300">
                {i + 1}
              </span>
              <span className="text-[10px] text-sky-800 dark:text-sky-200">{s.step[locale]}</span>
            </div>
            <span className="text-[10px] font-bold text-sky-700 dark:text-sky-300">
              {s.count[locale]}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-center text-[9px] text-sky-600 dark:text-sky-400">{footerText}</p>
    </div>
  );
}
