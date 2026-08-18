'use client';

import { cn } from '@galaxy/shared';

const TIPS = [
  {
    emoji: '',
    title: { ar: 'تقشير أسبوعي', en: 'Weekly exfoliation' },
    desc: { ar: 'يزيل الخلايا الميتة ويجدد البشرة', en: 'Removes dead cells and renews the skin' },
  },
  {
    emoji: '',
    title: { ar: 'ترطيب بعد الاستحمام', en: 'Moisturize after showering' },
    desc: {
      ar: 'البشرة تمتص المرطب أفضل وهي رطبة',
      en: 'Skin absorbs moisturizer best while damp',
    },
  },
  {
    emoji: '️',
    title: { ar: 'واقي للجسم', en: 'Body sunscreen' },
    desc: { ar: 'لا تنسي رقبتك ويديك وقدميك', en: "Don't forget your neck, hands and feet" },
  },
  {
    emoji: '',
    title: { ar: 'شرب الماء', en: 'Drink water' },
    desc: { ar: 'بشرة الجسم تحتاج ترطيب من الداخل', en: 'Body skin needs hydration from within' },
  },
];

interface BeautyBodyCareCardProps {
  className?: string;
  title?: string;
  subtitle?: string;
  locale?: 'ar' | 'en';
}

export function BeautyBodyCareCard({
  className = '',
  title = 'عناية بالجسم',
  subtitle = 'بشرة ناعمة من الرأس للقدمين',
  locale = 'ar',
}: BeautyBodyCareCardProps): JSX.Element {
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
      <div className="mt-3 space-y-1.5">
        {TIPS.map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-teal-50 px-3 py-2 dark:bg-teal-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <div>
              <p className="text-[10px] font-bold text-teal-800 dark:text-teal-200">
                {t.title[locale]}
              </p>
              <p className="text-[9px] text-teal-600 dark:text-teal-400">{t.desc[locale]}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
