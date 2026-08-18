'use client';
import { cn } from '@galaxy/shared';
export function BeautyCleanBeautyCard({
  className = '',
  title = 'الجمال النظيف',
  subtitle = 'منتجات آمنة — بدون سموم',
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
        'rounded-2xl border border-sky-100 bg-white p-4 dark:border-sky-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-sky-700 dark:text-sky-300">{title}</h4>
          <p className="text-[10px] text-sky-500 dark:text-sky-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'بدون: بارابين، سلفات، فثالات، فورمالديهايد',
              en: 'Free of: parabens, sulfates, phthalates, formaldehyde',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'مكونات نباتية — غير مختبرة على الحيوانات',
              en: 'Plant-based ingredients — not tested on animals',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'اقرئي الملصق — أول 5 مكونات هي الأساس',
              en: 'Read the label — the first 5 ingredients matter most',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'شهادات: EWG Verified، COSMOS، Leaping Bunny',
              en: 'Certifications: EWG Verified, COSMOS, Leaping Bunny',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-sky-50 px-3 py-2 dark:bg-sky-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-sky-800 dark:text-sky-200">{t.text[locale]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
