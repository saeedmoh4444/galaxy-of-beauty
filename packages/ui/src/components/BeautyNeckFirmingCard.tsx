'use client';
import { cn } from '@galaxy/shared';
export function BeautyNeckFirmingCard({
  className = '',
  title = 'شد الرقبة',
  subtitle = 'تمارين وكريمات للرقبة المشدودة',
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
        'rounded-2xl border border-teal-100 bg-white p-4 dark:border-teal-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-teal-700 dark:text-teal-300">{title}</h4>
          <p className="text-[10px] text-teal-500 dark:text-teal-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'تمرين O —— مددي شفاهكِ — 15 مرة',
              en: 'The "O" exercise — pucker your lips — 15 times',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'مد الرقبة — انظري للسقف 10 ثوانٍ',
              en: 'Stretch the neck — look at the ceiling for 10 seconds',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'كريمات الشد — كافيين وببتيدات',
              en: 'Firming creams — caffeine and peptides',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'مساج للأعلى — من الترقوة للذقن',
              en: 'Massage upward — from collarbone to chin',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-teal-50 px-3 py-2 dark:bg-teal-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-teal-800 dark:text-teal-200">{t.text[locale]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
