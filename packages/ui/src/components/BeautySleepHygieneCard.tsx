'use client';

import { cn } from '@galaxy/shared';

interface BeautySleepHygieneCardProps {
  className?: string;
  title?: string;
  subtitle?: string;
  locale?: 'ar' | 'en';
}

export function BeautySleepHygieneCard({
  className = '',
  title = 'نوم صحي',
  subtitle = 'عادات للنوم العميق',
  locale = 'ar',
}: BeautySleepHygieneCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-indigo-100 bg-white p-4 dark:border-indigo-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-300">{title}</h4>
          <p className="text-[10px] text-indigo-500 dark:text-indigo-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          {
            emoji: '',
            label: { ar: 'لا شاشات', en: 'No screens' },
            tip: { ar: 'قبل النوم بساعة', en: 'An hour before bed' },
          },
          {
            emoji: '️',
            label: { ar: 'غرفة باردة', en: 'Cool room' },
            tip: { ar: '18-20 درجة مئوية', en: '18-20°C' },
          },
          {
            emoji: '️',
            label: { ar: 'روتين ثابت', en: 'Consistent routine' },
            tip: { ar: 'نفس الموعد يومياً', en: 'Same time every day' },
          },
          {
            emoji: '',
            label: { ar: 'لا كافيين', en: 'No caffeine' },
            tip: { ar: 'بعد الرابعة عصراً', en: 'After 4 PM' },
          },
        ].map((t) => (
          <div key={t.label.ar} className="rounded-lg bg-indigo-50 px-2.5 py-2 dark:bg-indigo-950">
            <span className="text-sm">{t.emoji}</span>
            <p className="mt-0.5 text-[10px] font-bold text-indigo-800 dark:text-indigo-200">
              {t.label[locale]}
            </p>
            <p className="text-[9px] text-indigo-600 dark:text-indigo-400">{t.tip[locale]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
