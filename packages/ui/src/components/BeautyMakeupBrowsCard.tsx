'use client';
import { cn } from '@galaxy/shared';
export function BeautyMakeupBrowsCard({
  className = '',
  heading = 'تحديد الحواجب',
  subtitle = 'إطار الوجه بالمكياج',
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
        'rounded-2xl border border-amber-100 bg-white p-4 dark:border-amber-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">️</span>
        <div>
          <h4 className="text-sm font-bold text-amber-700 dark:text-amber-300">{heading}</h4>
          <p className="text-[10px] text-amber-500 dark:text-amber-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'بداية الحاجب = عند طرف الأنف',
              en: 'Brow start = at the edge of the nose',
            },
          },
          {
            emoji: '️',
            text: { ar: 'القوس = فوق البؤبؤ مباشرة', en: 'The arch = directly above the pupil' },
          },
          {
            emoji: '️',
            text: {
              ar: 'النهاية = زاوية الأنف لطرف العين',
              en: 'The tail = from nose corner to outer eye corner',
            },
          },
          {
            emoji: '️',
            text: {
              ar: 'حركات خفيفة تشبه الشعر — وليس خطاً واحداً',
              en: 'Light hair-like strokes — not one solid line',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 dark:bg-amber-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-amber-800 dark:text-amber-200">{t.text[locale]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
