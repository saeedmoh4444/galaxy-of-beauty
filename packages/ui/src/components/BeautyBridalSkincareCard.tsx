'use client';
import { cn } from '@galaxy/shared';
export function BeautyBridalSkincareCard({
  className = '',
  title = 'بشرة العروس',
  subtitle = 'خطة 6 أشهر لبشرة الزفاف',
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
              ar: '6 أشهر: بدء روتين عناية + واقي شمس يومي',
              en: '6 months: start a care routine + daily SPF',
            },
          },
          {
            emoji: '',
            text: {
              ar: '3 أشهر: أول جلسة فيشل + تحديد المشاكل',
              en: '3 months: first facial + address concerns',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'شهر واحد: آخر تقشير — لا تجارب جديدة',
              en: '1 month: last peel — no new experiments',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'أسبوع الزفاف: ترطيب مكثف — بشرة مشرقة',
              en: 'Wedding week: intense hydration — radiant skin',
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
