'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Nail Care Card — nail health & care tips.
 * From Phase W6: Education & Empowerment.
 *
 * Usage:
 *   <BeautyNailCareCard />
 */

const TIPS = [
  {
    emoji: '',
    title: { ar: 'ترطيب يومي', en: 'Daily hydration' },
    desc: {
      ar: 'زيت الأظافر يومياً للحفاظ على الترطيب',
      en: 'Nail oil daily to maintain moisture',
    },
  },
  {
    emoji: '',
    title: { ar: 'برد باتجاه واحد', en: 'File one direction' },
    desc: {
      ar: 'لا تبردي ذهاباً وإياباً — يضعف الظفر',
      en: 'Do not file back and forth — it weakens the nail',
    },
  },
  {
    emoji: '',
    title: { ar: 'قفازات الحماية', en: 'Protective gloves' },
    desc: { ar: 'احمي أظافركِ من المواد الكيميائية', en: 'Protect your nails from chemicals' },
  },
  {
    emoji: '',
    title: { ar: 'تغذية', en: 'Nutrition' },
    desc: { ar: 'بيوتين وزنك وزنك — غذاء الأظافر', en: 'Biotin and zinc — nail food' },
  },
];

interface BeautyNailCareCardProps {
  className?: string;
  title?: string;
  subtitle?: string;
  locale?: 'ar' | 'en';
}

export function BeautyNailCareCard({
  className = '',
  title = 'عناية بالأظافر',
  subtitle = 'نصائح لأظافر قوية وجميلة',
  locale = 'ar',
}: BeautyNailCareCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-pink-100 bg-white p-4 dark:border-pink-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true"></span>
        <div>
          <h4 className="text-sm font-bold text-pink-700 dark:text-pink-300">{title}</h4>
          <p className="text-[10px] text-pink-500 dark:text-pink-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {TIPS.map((t) => (
          <div key={t.title.ar} className="rounded-lg bg-pink-50 px-2.5 py-2 dark:bg-pink-950">
            <span className="text-sm">{t.emoji}</span>
            <p className="mt-0.5 text-[10px] font-bold text-pink-800 dark:text-pink-200">
              {t.title[locale]}
            </p>
            <p className="text-[9px] text-pink-600 dark:text-pink-400">{t.desc[locale]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
