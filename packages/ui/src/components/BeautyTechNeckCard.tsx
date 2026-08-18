'use client';
import { cn } from '@galaxy/shared';
export function BeautyTechNeckCard({
  className = '',
  locale = 'ar',
  title = 'تجاعيد الجوال',
  subtitle = 'Tech Neck — أثر النظر للأسفل',
}: {
  className?: string;
  locale?: 'ar' | 'en';
  title?: string;
  subtitle?: string;
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
              ar: 'ارفعي الجوال — لمستوى العين وليس للأسفل',
              en: 'Raise your phone — to eye level, not down',
            },
          },
          {
            emoji: '🪑',
            text: {
              ar: 'وضعية الجلوس — ظهر مستقيم وشاشة مرتفعة',
              en: 'Sitting posture — straight back, raised screen',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'تمارين الرقبة — مد وإطالة يومياً',
              en: 'Neck exercises — stretching daily',
            },
          },
          {
            emoji: '',
            text: { ar: 'كريمات الببتيد — تحفز الكولاجين', en: 'Peptide creams — boost collagen' },
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
