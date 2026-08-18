'use client';
import { cn } from '@galaxy/shared';
export function BeautyMicroneedlingCard({
  className = '',
  title = 'المايكرونيدلنغ',
  subtitle = 'إبر دقيقة — نتائج مذهلة',
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
              ar: 'يحفز الكولاجين — إبر دقيقة تخترق الجلد',
              en: 'Stimulates collagen — fine needles penetrate the skin',
            },
          },
          {
            emoji: '',
            text: { ar: 'يعالج الندبات والمسام الواسعة', en: 'Treats scars and enlarged pores' },
          },
          {
            emoji: '️',
            text: {
              ar: 'جلسة كل 4-6 أسابيع — 3-6 جلسات',
              en: 'A session every 4-6 weeks — 3-6 sessions',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'بعد الجلسة — سيروم هيالورونيك أسيد فقط',
              en: 'After the session — hyaluronic acid serum only',
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
