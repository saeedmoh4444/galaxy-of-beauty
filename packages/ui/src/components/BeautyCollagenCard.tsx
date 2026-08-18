'use client';
import { cn } from '@galaxy/shared';
export function BeautyCollagenCard({
  className = '',
  title = 'الكولاجين',
  subtitle = 'بروتين الشباب — بشرة مشدودة',
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
        'rounded-2xl border border-rose-100 bg-white p-4 dark:border-rose-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-rose-700 dark:text-rose-300">{title}</h4>
          <p className="text-[10px] text-rose-500 dark:text-rose-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'كولاجين سائل — أسرع امتصاصاً من الحبوب',
              en: 'Liquid collagen — absorbed faster than pills',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'مع فيتامين C — ضروري لامتصاص الكولاجين',
              en: 'With vitamin C — essential for collagen absorption',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'بعد 25 سنة — الإنتاج الطبيعي يبدأ بالانخفاض',
              en: 'After 25 — natural production starts declining',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'يفيد البشرة، الشعر، الأظافر والمفاصل',
              en: 'Benefits skin, hair, nails, and joints',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 dark:bg-rose-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-rose-800 dark:text-rose-200">{t.text[locale]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
