'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Hair Care Card — hair type-specific care tips.
 * From Phase W6: Education & Empowerment.
 *
 * Usage:
 *   <BeautyHairCareCard hairType="curly" porosity="high" />
 */

type HairType = 'straight' | 'wavy' | 'curly' | 'coily';
type Porosity = 'low' | 'medium' | 'high';

const TIPS: Record<HairType, Record<Porosity, { ar: string; en: string }[]>> = {
  straight: {
    low: [
      { ar: 'شامبو منقي أسبوعياً', en: 'Clarifying shampoo weekly' },
      { ar: 'بلسم خفيف', en: 'Light conditioner' },
      { ar: 'تجنبي الزيوت الثقيلة', en: 'Avoid heavy oils' },
    ],
    medium: [
      { ar: 'غسيل كل 2-3 أيام', en: 'Wash every 2-3 days' },
      { ar: 'بلسم متوسط', en: 'Medium conditioner' },
      { ar: 'حماية من الحرارة', en: 'Heat protection' },
    ],
    high: [
      { ar: 'شامبو مرطب', en: 'Moisturizing shampoo' },
      { ar: 'بلسم عميق', en: 'Deep conditioner' },
      { ar: 'زيوت خفيفة على الأطراف', en: 'Light oils on the ends' },
    ],
  },
  wavy: {
    low: [
      { ar: 'شامبو منقي', en: 'Clarifying shampoo' },
      { ar: 'بلسم خفيف', en: 'Light conditioner' },
      { ar: 'منتجات رغوة', en: 'Foam products' },
    ],
    medium: [
      { ar: 'غسيل يومين ورا بعض', en: 'Wash every other day' },
      { ar: 'بلسم متوسط', en: 'Medium conditioner' },
      { ar: 'سيروم خفيف', en: 'Light serum' },
    ],
    high: [
      { ar: 'Co-wash', en: 'Co-wash' },
      { ar: 'بلسم عميق', en: 'Deep conditioner' },
      { ar: 'زيوت طبيعية', en: 'Natural oils' },
    ],
  },
  curly: {
    low: [
      { ar: 'شامبو منقي شهرياً', en: 'Monthly clarifying shampoo' },
      { ar: 'Co-wash أسبوعياً', en: 'Weekly co-wash' },
      { ar: 'منتجات خفيفة', en: 'Light products' },
    ],
    medium: [
      { ar: 'Co-wash', en: 'Co-wash' },
      { ar: 'بلسم عميق', en: 'Deep conditioner' },
      { ar: 'جل تصفيف', en: 'Styling gel' },
    ],
    high: [
      { ar: 'Co-wash', en: 'Co-wash' },
      { ar: 'قناع شعر أسبوعي', en: 'Weekly hair mask' },
      { ar: 'زيوت وكريمات', en: 'Oils and creams' },
    ],
  },
  coily: {
    low: [
      { ar: 'Co-wash', en: 'Co-wash' },
      { ar: 'منتجات خفيفة', en: 'Light products' },
      { ar: 'صبقة شعر', en: 'Hair butter' },
    ],
    medium: [
      { ar: 'Co-wash', en: 'Co-wash' },
      { ar: 'قناع عميق', en: 'Deep mask' },
      { ar: 'زبدة شعر', en: 'Hair butter' },
    ],
    high: [
      { ar: 'Co-wash', en: 'Co-wash' },
      { ar: 'قناع أسبوعي', en: 'Weekly mask' },
      { ar: 'زيوت ثقيلة', en: 'Heavy oils' },
    ],
  },
};

const LABELS: Record<HairType, { ar: string; en: string }> = {
  straight: { ar: 'ناعم', en: 'Straight' },
  wavy: { ar: 'مموج', en: 'Wavy' },
  curly: { ar: 'مجعد', en: 'Curly' },
  coily: { ar: 'متعرج', en: 'Coily' },
};

const POROSITY_WORDS: Record<Porosity, { ar: string; en: string }> = {
  low: { ar: 'منخفضة', en: 'Low' },
  medium: { ar: 'متوسطة', en: 'Medium' },
  high: { ar: 'عالية', en: 'High' },
};

interface BeautyHairCareCardProps {
  hairType: HairType;
  porosity?: Porosity;
  className?: string;
  /** Header title */
  title?: string;
  /** Label before the porosity level */
  porosityLabel?: string;
  /** Locale for internal hair care data strings */
  locale?: 'ar' | 'en';
}

export function BeautyHairCareCard({
  hairType,
  porosity = 'medium',
  className = '',
  title = 'عناية بالشعر',
  porosityLabel = 'مسامية',
  locale = 'ar',
}: BeautyHairCareCardProps): JSX.Element {
  const tips = TIPS[hairType][porosity];

  return (
    <div
      className={cn(
        'rounded-2xl border border-purple-100 bg-white p-4 dark:border-purple-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true"></span>
        <div>
          <h4 className="text-sm font-bold text-purple-700 dark:text-purple-300">{title}</h4>
          <p className="text-[10px] text-purple-500 dark:text-purple-400">
            {LABELS[hairType][locale]} · {porosityLabel} {POROSITY_WORDS[porosity][locale]}
          </p>
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        {tips.map((tip, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-purple-50 px-3 py-2 dark:bg-purple-950"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-200 text-[9px] font-bold text-purple-700 dark:bg-purple-800 dark:text-purple-300">
              {i + 1}
            </span>
            <span className="text-[10px] text-purple-800 dark:text-purple-200">{tip[locale]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
