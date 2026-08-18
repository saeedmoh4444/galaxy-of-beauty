'use client';
import { cn } from '@galaxy/shared';
export function BeautyChemicalPeelCard({
  className = '',
  title = 'التقشير الكيميائي',
  subtitle = 'تجديد البشرة بطريقة احترافية',
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
        'rounded-2xl border border-amber-100 bg-white p-4 dark:border-amber-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-amber-700 dark:text-amber-300">{title}</h4>
          <p className="text-[10px] text-amber-500 dark:text-amber-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          {
            emoji: '',
            label: { ar: 'سطحي', en: 'Superficial' },
            tip: { ar: 'أحماض خفيفة — لا وقت تعافي', en: 'Light acids — no downtime' },
          },
          {
            emoji: '',
            label: { ar: 'متوسط', en: 'Medium' },
            tip: {
              ar: 'يخترق أعمق — 3-5 أيام تقشير',
              en: 'Penetrates deeper — 3-5 days of peeling',
            },
          },
          {
            emoji: '',
            label: { ar: 'عميق', en: 'Deep' },
            tip: { ar: 'طبيب فقط — نتائج قوية', en: 'Doctor only — powerful results' },
          },
          {
            emoji: '️',
            label: { ar: 'بعد الجلسة', en: 'After the session' },
            tip: { ar: 'واقي شمس — ضروري جداً', en: 'Sunscreen — absolutely essential' },
          },
        ].map((t, i) => (
          <div key={i} className="rounded-lg bg-amber-50 px-2.5 py-2 dark:bg-amber-950">
            <span className="text-sm">{t.emoji}</span>
            <p className="mt-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-200">
              {t.label[locale]}
            </p>
            <p className="text-[9px] text-amber-600 dark:text-amber-400">{t.tip[locale]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
