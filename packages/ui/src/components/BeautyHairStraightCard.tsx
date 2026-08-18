'use client';
import { cn } from '@galaxy/shared';
export function BeautyHairStraightCard({
  className = '',
  title = 'الشعر الناعم',
  subtitle = 'عناية خاصة بالشعر الأملس',
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
            text: { ar: 'شامبو منقي — مرة أسبوعياً', en: 'Clarifying shampoo — once a week' },
          },
          {
            emoji: '',
            text: {
              ar: 'بلسم خفيف — لا يثقل الشعر',
              en: 'Light conditioner — does not weigh hair down',
            },
          },
          { emoji: '', text: { ar: 'سيروم لمعان — لأطراف فقط', en: 'Shine serum — ends only' } },
          { emoji: '', text: { ar: 'غسيل كل 2-3 أيام', en: 'Wash every 2-3 days' } },
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
