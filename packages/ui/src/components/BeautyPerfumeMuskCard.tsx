'use client';
import { cn } from '@galaxy/shared';
export function BeautyPerfumeMuskCard({
  className = '',
  title = 'المسك',
  subtitle = 'أساس العطور العربية',
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
        'rounded-2xl border border-purple-100 bg-white p-4 dark:border-purple-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-purple-700 dark:text-purple-300">{title}</h4>
          <p className="text-[10px] text-purple-500 dark:text-purple-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'المسك الأبيض — أنقى وأخف أنواع المسك',
              en: 'White musk — the purest and lightest type',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'يدمج مع الورد — للعطور النسائية',
              en: 'Blends with rose — for feminine fragrances',
            },
          },
          {
            emoji: '🪵',
            text: {
              ar: 'يدمج مع العود — للعطور القوية',
              en: 'Blends with oud — for bold fragrances',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'زيت المسك — يدوم أطول من العطر الكحولي',
              en: 'Musk oil — lasts longer than alcohol-based perfume',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-purple-50 px-3 py-2 dark:bg-purple-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-purple-800 dark:text-purple-200">
              {t.text[locale]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
