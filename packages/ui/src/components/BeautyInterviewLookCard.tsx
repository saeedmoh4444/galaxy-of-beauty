'use client';
import { cn } from '@galaxy/shared';
export function BeautyInterviewLookCard({
  className = '',
  heading = 'إطلالة المقابلة',
  subtitle = 'ثقة — واحترافية',
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
        'rounded-2xl border border-sky-100 bg-white p-4 dark:border-sky-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-sky-700 dark:text-sky-300">{heading}</h4>
          <p className="text-[10px] text-sky-500 dark:text-sky-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'مكياج طبيعي — BB كريم + ماسكارا + بلسم شفاه',
              en: 'Natural makeup — BB cream + mascara + lip balm',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'أظافر محايدة — Nude أو فرنسي كلاسيك',
              en: 'Neutral nails — nude or classic French',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'تسريحة مرتبة — كعكة منخفضة أو شعر منسدل أنيق',
              en: 'Tidy hairstyle — low bun or sleek loose hair',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'عطر خفيف — منعش وغير قوي',
              en: 'Light fragrance — fresh, not overpowering',
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
