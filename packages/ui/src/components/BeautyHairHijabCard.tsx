'use client';
import { cn } from '@galaxy/shared';
export function BeautyHairHijabCard({
  className = '',
  title = 'الشعر تحت الحجاب',
  subtitle = 'عناية خاصة لشعر المحجبات',
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
        'rounded-2xl border border-emerald-100 bg-white p-4 dark:border-emerald-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{title}</h4>
          <p className="text-[10px] text-emerald-500 dark:text-emerald-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'بطانة حرير — تقلل الاحتكاك وتكسر الشعر',
              en: 'A silk lining — reduces friction and hair breakage',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'فكي الشعر فور العودة — دعيه يتنفس',
              en: 'Release your hair as soon as you are home — let it breathe',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'تدليك فروة الرأس — يحسن الدورة',
              en: 'Scalp massage — improves circulation',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'زيت خفيف — قبل لف الحجاب بساعة',
              en: 'A light oil — an hour before wrapping the hijab',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 dark:bg-emerald-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-emerald-800 dark:text-emerald-200">
              {t.text[locale]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
