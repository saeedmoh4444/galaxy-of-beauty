'use client';
import { cn } from '@galaxy/shared';
export function BeautyBreakoutSOSCard({
  className = '',
  title = 'طوارئ الحبوب',
  subtitle = 'ظهور مفاجئ — حل سريع',
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
        'rounded-2xl border border-red-100 bg-white p-4 dark:border-red-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-red-700 dark:text-red-300">{title}</h4>
          <p className="text-[10px] text-red-500 dark:text-red-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'كمادة ثلج — 5 دقائق لتقليل الالتهاب',
              en: 'Ice compress — 5 minutes to reduce inflammation',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'لصقة حبوب — تجفف وتحمي من العبث',
              en: 'Pimple patch — dries it out and stops picking',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'لا تضغطي — يزيد الالتهاب ويترك أثراً',
              en: "Don't squeeze — it worsens inflammation and leaves a mark",
            },
          },
          {
            emoji: '',
            text: {
              ar: 'كريم بنزويل بيروكسايد — للطوارئ فقط',
              en: 'Benzoyl peroxide cream — for emergencies only',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 dark:bg-red-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-red-800 dark:text-red-200">{t.text[locale]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
