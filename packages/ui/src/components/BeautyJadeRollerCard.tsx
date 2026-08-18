'use client';
import { cn } from '@galaxy/shared';
export function BeautyJadeRollerCard({
  className = '',
  subtitle = 'بكرة اليشم للوجه',
  locale = 'ar',
}: {
  className?: string;
  subtitle?: string;
  locale?: 'ar' | 'en';
}): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-emerald-100 bg-white p-4 dark:border-emerald-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">🪨</span>
        <div>
          <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Jade Roller</h4>
          <p className="text-[10px] text-emerald-500 dark:text-emerald-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '️',
            text: {
              ar: 'احفظيها في الثلاجة — تأثير منعش',
              en: 'Keep it in the fridge — for a refreshing effect',
            },
          },
          { emoji: '️', text: { ar: 'دحرجي للأعلى وللخارج', en: 'Roll upward and outward' } },
          {
            emoji: '',
            text: { ar: 'بعد السيروم — لتسهيل الامتصاص', en: 'After serum — to help absorption' },
          },
          {
            emoji: '️',
            text: { ar: 'صباحاً — لتقليل الانتفاخ', en: 'In the morning — to reduce puffiness' },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 dark:bg-emerald-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-emerald-800 dark:text-emerald-200">
              {t.text[locale]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
