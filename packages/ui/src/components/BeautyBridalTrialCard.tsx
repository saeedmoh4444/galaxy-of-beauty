'use client';
import { cn } from '@galaxy/shared';
export function BeautyBridalTrialCard({
  className = '',
  title = 'تجربة العروس',
  subtitle = 'بروفة المكياج والشعر',
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
              ar: 'قبل الزفاف بشهر — الوقت المثالي للتجربة',
              en: 'A month before the wedding — the ideal time to trial',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'صوري الإطلالة — لتقييمها لاحقاً',
              en: 'Photograph the look — to review it later',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'ارتدي أبيض — لترى التناسق مع الفستان',
              en: 'Wear white — to see how it pairs with the dress',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'كوني صريحة — هذه تجربتكِ وليس يوم الزفاف',
              en: 'Be honest — this is your trial, not the wedding day',
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
