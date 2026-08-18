'use client';
import { cn } from '@galaxy/shared';
export function BeautyAfterBotoxCard({
  className = '',
  title = 'بعد البوتوكس',
  subtitle = 'تعليمات ما بعد الحقن',
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
              ar: 'لا تلمسي — لا تدلكي المنطقة 24 ساعة',
              en: "Don't touch — don't massage the area for 24 hours",
            },
          },
          {
            emoji: '',
            text: {
              ar: 'ابقِ رأسك مرفوعاً — 4 ساعات بعد الحقن',
              en: 'Keep your head elevated — for 4 hours after the injections',
            },
          },
          { emoji: '', text: { ar: 'لا رياضة — 24 ساعة', en: 'No exercise — for 24 hours' } },
          {
            emoji: '️',
            text: { ar: 'النتيجة النهائية — بعد 10-14 يوم', en: 'Final result — after 10-14 days' },
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
