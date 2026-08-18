'use client';

import { cn } from '@galaxy/shared';

/**
 * Allergy Safe Badge — hypoallergenic product options for sensitive skin.
 * From Phase W3: Health & Wellness Integration.
 *
 * Usage:
 *   <AllergySafeBadge allergies={['fragrance', 'nuts', 'dairy', 'gluten']} />
 */

type Allergy =
  'fragrance' | 'nuts' | 'dairy' | 'gluten' | 'paraben' | 'sulfate' | 'alcohol' | 'essential_oils';

interface AllergyDef {
  emoji: string;
  label: { ar: string; en: string };
}

const ALLERGIES: Record<Allergy, AllergyDef> = {
  fragrance: { emoji: '', label: { ar: 'عطور', en: 'Fragrance' } },
  nuts: { emoji: '', label: { ar: 'مكسرات', en: 'Nuts' } },
  dairy: { emoji: '', label: { ar: 'ألبان', en: 'Dairy' } },
  gluten: { emoji: '', label: { ar: 'جلوتين', en: 'Gluten' } },
  paraben: { emoji: '', label: { ar: 'بارابين', en: 'Parabens' } },
  sulfate: { emoji: '🫧', label: { ar: 'سلفات', en: 'Sulfates' } },
  alcohol: { emoji: '', label: { ar: 'كحول', en: 'Alcohol' } },
  essential_oils: { emoji: '🫒', label: { ar: 'زيوت عطرية', en: 'Essential oils' } },
};

interface AllergySafeBadgeProps {
  allergies: Allergy[];
  className?: string;
  /** Badge heading */
  title?: string;
  /** Subtitle under the heading */
  subtitle?: string;
  /** "How we ensure safety" heading */
  howTitle?: string;
  /** Safety bullet items */
  benefit1?: string;
  benefit2?: string;
  benefit3?: string;
  benefit4?: string;
  /** Disclaimer footer */
  disclaimer?: string;
  /** Display locale for allergy labels */
  locale?: 'ar' | 'en';
}

export function AllergySafeBadge({
  allergies,
  className = '',
  title = 'خالٍ من مسببات الحساسية',
  subtitle = 'منتجات آمنة للبشرة الحساسة — خالية من',
  howTitle = 'كيف نضمن سلامتكِ',
  benefit1 = '• نسألكِ عن الحساسية عند الحجز',
  benefit2 = '• نستخدم منتجات منفصلة ومعقمة',
  benefit3 = '• اختبار رقعة قبل أي منتج جديد',
  benefit4 = '• فريق مدرب على التعامل مع الحساسية',
  disclaimer = '🩺 أخبرينا عن حساسيتكِ عند الحجز — سلامتكِ تهمنا',
  locale = 'ar',
}: AllergySafeBadgeProps): JSX.Element | null {
  if (!allergies.length) return null;

  return (
    <div
      className={cn(
        'rounded-2xl border border-emerald-100 bg-white p-4 dark:border-emerald-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true">
          ️
        </span>
        <div>
          <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{title}</h4>
          <p className="text-[10px] text-emerald-500 dark:text-emerald-400">{subtitle}</p>
        </div>
      </div>

      {/* Allergy chips */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {allergies.map((a) => {
          const def = ALLERGIES[a];
          return (
            <span
              key={a}
              className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
            >
              {def.emoji} {def.label[locale]}
            </span>
          );
        })}
      </div>

      {/* How we handle */}
      <div className="mt-3 rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950">
        <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-200">{howTitle}</p>
        <div className="mt-1 space-y-0.5 text-[10px] text-emerald-700 dark:text-emerald-300">
          <p>{benefit1}</p>
          <p>{benefit2}</p>
          <p>{benefit3}</p>
          <p>{benefit4}</p>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        {disclaimer}
      </p>
    </div>
  );
}
