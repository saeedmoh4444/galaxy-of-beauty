'use client';

import { cn } from '@galaxy/shared';

const TIPS = [
  {
    emoji: '',
    title: { ar: 'نقع أسبوعي', en: 'Weekly soak' },
    desc: { ar: 'ماء دافئ وملح إنكليزي 15 دقيقة', en: 'Warm water and Epsom salt for 15 minutes' },
  },
  {
    emoji: '🪨',
    title: { ar: 'حجر الخفاف', en: 'Pumice stone' },
    desc: { ar: 'لإزالة الجلد الميت بلطف', en: 'To remove dead skin gently' },
  },
  {
    emoji: '',
    title: { ar: 'ترطيب عميق', en: 'Deep moisturizing' },
    desc: { ar: 'كريم مرطب قبل النوم مع جوارب', en: 'Moisturizing cream before bed with socks' },
  },
  {
    emoji: '',
    title: { ar: 'عناية بالأظافر', en: 'Nail care' },
    desc: { ar: 'قص مستقيم لمنع الانغراس', en: 'Cut straight across to prevent ingrown nails' },
  },
];

interface BeautyFootCareCardProps {
  className?: string;
  title?: string;
  subtitle?: string;
  locale?: 'ar' | 'en';
}

export function BeautyFootCareCard({
  className = '',
  title = 'عناية بالقدمين',
  subtitle = 'أقدام ناعمة طوال العام',
  locale = 'ar',
}: BeautyFootCareCardProps): JSX.Element {
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
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {TIPS.map((t) => (
          <div key={t.title.ar} className="rounded-lg bg-teal-50 px-2.5 py-2 dark:bg-teal-950">
            <span className="text-sm">{t.emoji}</span>
            <p className="mt-0.5 text-[10px] font-bold text-teal-800 dark:text-teal-200">
              {t.title[locale]}
            </p>
            <p className="text-[9px] text-teal-600 dark:text-teal-400">{t.desc[locale]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
