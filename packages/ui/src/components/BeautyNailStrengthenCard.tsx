'use client';
import { cn } from '@galaxy/shared';
export function BeautyNailStrengthenCard({
  className = '',
  title = 'تقوية الأظافر',
  subtitle = 'أظافر قوية — بدون تكسر',
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
        <span className="text-xl">💅</span>
        <div>
          <h4 className="text-sm font-bold text-brand-700 dark:text-brand-300">{title}</h4>
          <p className="text-[10px] text-brand-500 dark:text-brand-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '💅',
            text: {
              ar: 'مقوي أظافر — طبقة أساس قبل الطلاء',
              en: 'A nail hardener — a base layer before polish',
            },
          },
          {
            emoji: '💧',
            text: {
              ar: 'زيت الأظافر — يومياً على الظفر والبشرة',
              en: 'Nail oil — daily on the nail and cuticle',
            },
          },
          {
            emoji: '💊',
            text: {
              ar: 'بيوتين وزنك — من الداخل للخارج',
              en: 'Biotin and zinc — from the inside out',
            },
          },
          {
            emoji: '🧤',
            text: {
              ar: 'قفازات للتنظيف — احمي أظافركِ',
              en: 'Cleaning gloves — protect your nails',
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
