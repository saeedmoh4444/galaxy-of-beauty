'use client';
import { cn } from '@galaxy/shared';
export function BeautyTravelPackingCard({
  className = '',
  locale = 'ar',
  title = 'تعبئة حقيبة السفر',
  subtitle = 'خذي الأساسيات — بدون فوضى',
}: {
  className?: string;
  locale?: 'ar' | 'en';
  title?: string;
  subtitle?: string;
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
              ar: 'عبوات سفر صغيرة — أعيدي تعبئتها من الكبيرة',
              en: 'Small travel bottles — refill them from large ones',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'باليت متعدد — خدود + عيون + هايلايتر',
              en: 'Multi-palette — blush + eyes + highlighter',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'قائمة أساسيات — لا تنسي شيئاً',
              en: 'An essentials list — never forget anything',
            },
          },
          {
            emoji: '️',
            text: {
              ar: 'حقيبة شفافة — للمطار والفحص الأمني',
              en: 'Clear bag — for the airport and security checks',
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
