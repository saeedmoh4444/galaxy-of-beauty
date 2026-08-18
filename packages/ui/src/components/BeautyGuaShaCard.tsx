'use client';
import { cn } from '@galaxy/shared';
export function BeautyGuaShaCard({
  className = '',
  subtitle = 'التدليك بالحجر الصيني',
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
          <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Gua Sha</h4>
          <p className="text-[10px] text-emerald-500 dark:text-emerald-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: { ar: 'حركات للأعلى وللخارج دائماً', en: 'Always move upward and outward' },
          },
          {
            emoji: '🫒',
            text: {
              ar: 'استخدمي زيت وجه — لتسهيل الانزلاق',
              en: 'Use a facial oil — for easier gliding',
            },
          },
          {
            emoji: '',
            text: { ar: 'زاوية 15 درجة — ليست عمودية', en: 'A 15-degree angle — not vertical' },
          },
          {
            emoji: '',
            text: { ar: '5 دقائق — 3 مرات أسبوعياً', en: '5 minutes — 3 times a week' },
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
