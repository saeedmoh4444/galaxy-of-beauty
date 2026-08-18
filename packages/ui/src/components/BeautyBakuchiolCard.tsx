'use client';
import { cn } from '@galaxy/shared';
export function BeautyBakuchiolCard({
  className = '',
  title = 'الباكوتشيول',
  subtitle = 'بديل الريتينول الطبيعي',
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
        'rounded-2xl border border-emerald-100 bg-white p-4 dark:border-emerald-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{title}</h4>
          <p className="text-[10px] text-emerald-500 dark:text-emerald-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'نباتي 100% — مستخلص من نبات البسوراليا',
              en: '100% plant-based — extracted from the Psoralea plant',
            },
          },
          {
            emoji: '️',
            text: {
              ar: 'آمن نهاراً — لا يتحسس من الشمس',
              en: 'Safe for daytime — no sun sensitivity',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'آمن للحوامل — بديل ممتاز للريتينول',
              en: 'Safe for pregnancy — an excellent retinol alternative',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'يحفز الكولاجين — بدون تهيج أو تقشير',
              en: 'Boosts collagen — without irritation or peeling',
            },
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
