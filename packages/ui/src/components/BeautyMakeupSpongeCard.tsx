'use client';
import { cn } from '@galaxy/shared';
export function BeautyMakeupSpongeCard({
  className = '',
  heading = 'إسفنجة المكياج',
  subtitle = 'سر بشرة flawless',
  locale = 'ar',
}: {
  className?: string;
  heading?: string;
  subtitle?: string;
  locale?: 'ar' | 'en';
}): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-pink-100 bg-white p-4 dark:border-pink-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-pink-700 dark:text-pink-300">{heading}</h4>
          <p className="text-[10px] text-pink-500 dark:text-pink-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'بلليها بالماء — تصبح أكبر وأنعم',
              en: 'Wet it with water — it expands and turns softer',
            },
          },
          {
            emoji: '',
            text: { ar: 'اضغطي — لا تمسحي', en: "Dab — don't rub" },
          },
          {
            emoji: '',
            text: { ar: 'اغسليها بعد كل استخدام', en: 'Wash it after every use' },
          },
          {
            emoji: '',
            text: { ar: 'استبدليها كل 3 أشهر', en: 'Replace it every 3 months' },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-pink-50 px-3 py-2 dark:bg-pink-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-pink-800 dark:text-pink-200">{t.text[locale]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
