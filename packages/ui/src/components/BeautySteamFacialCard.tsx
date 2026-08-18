'use client';
import { cn } from '@galaxy/shared';
export function BeautySteamFacialCard({
  className = '',
  locale = 'ar',
  title = 'بخار الوجه',
  subtitle = 'سبا منزلي بسيط',
}: {
  className?: string;
  locale?: 'ar' | 'en';
  title?: string;
  subtitle?: string;
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
              ar: 'أضيفي أعشاب — بابونج أو نعناع أو روزماري',
              en: 'Add herbs — chamomile, mint, or rosemary',
            },
          },
          {
            emoji: '️',
            text: { ar: '5-10 دقائق — مرتين أسبوعياً', en: '5-10 minutes — twice a week' },
          },
          {
            emoji: '',
            text: { ar: 'مسافة آمنة — 30 سم عن الوجه', en: 'Safe distance — 30 cm from the face' },
          },
          {
            emoji: '',
            text: {
              ar: 'بعد البخار — سيروم أو مرطب فوراً',
              en: 'After steaming — serum or moisturizer right away',
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
