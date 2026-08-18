'use client';
import { cn } from '@galaxy/shared';
export function BeautyBabyBluesCard({
  className = '',
  title = 'عناية الأم بعد الولادة',
  subtitle = 'نفسكِ مهمة — مثل طفلكِ',
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
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '🪞',
            text: {
              ar: '5 دقائق لكِ — غسل وجه وتنفس عميق',
              en: '5 minutes for you — wash your face and breathe deeply',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'لا تنعزلي — تحدثي مع صديقة أو أخت',
              en: "Don't isolate yourself — talk to a friend or sister",
            },
          },
          {
            emoji: '🩺',
            text: {
              ar: 'اكتئاب ما بعد الولادة — ليس ضعفاً',
              en: 'Postpartum depression — it is not weakness',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'أنتِ أم رائعة — لا تقسي على نفسكِ',
              en: 'You are an amazing mother — be gentle with yourself',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 dark:bg-indigo-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-indigo-800 dark:text-indigo-200">
              {t.text[locale]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
