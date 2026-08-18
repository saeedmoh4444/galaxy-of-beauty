'use client';

import { cn } from '@galaxy/shared';

/**
 * Grandmother Package Card — grandmother-of-the-bride/groom beauty package.
 * From Phase W2: Life Stage Beauty — Golden Beauty & W7: Mother-Daughter & Family.
 *
 * Usage:
 *   <GrandmotherPackageCard occasion="wedding" onBook={() => {}} />
 */

type Occasion = 'wedding' | 'graduation' | 'aqeeqah' | 'eid';

interface OccasionDef {
  emoji: string;
  title: { ar: string; en: string };
  look: { ar: string; en: string };
  price: number;
}

const OCCASIONS: Record<Occasion, OccasionDef> = {
  wedding: {
    emoji: '',
    title: { ar: 'جدة العروس', en: "Bride's grandmother" },
    look: { ar: 'مكياج كلاسيكي + تسريحة أنيقة', en: 'Classic makeup + elegant hairstyle' },
    price: 350,
  },
  graduation: {
    emoji: '',
    title: { ar: 'جدة الخريجة', en: "Graduate's grandmother" },
    look: { ar: 'مكياج ناعم + لمسة أناقة', en: 'Soft makeup + a touch of elegance' },
    price: 250,
  },
  aqeeqah: {
    emoji: '',
    title: { ar: 'جدة المولود', en: "Newborn's grandmother" },
    look: { ar: 'إطلالة دافئة ومبهجة', en: 'A warm, cheerful look' },
    price: 200,
  },
  eid: {
    emoji: '',
    title: { ar: 'إطلالة العيد', en: 'Eid look' },
    look: { ar: 'مكياج راقٍ + تسريحة تقليدية', en: 'Refined makeup + traditional hairstyle' },
    price: 300,
  },
};

interface GrandmotherPackageCardProps {
  occasion: Occasion;
  grandmaName?: string;
  onBook?: () => void;
  className?: string;
  /** "Package includes" heading */
  includesTitle?: string;
  /** Included service bullets */
  include1?: string;
  include2?: string;
  include3?: string;
  include4?: string;
  include5?: string;
  include6?: string;
  /** Currency suffix for the price */
  currencySuffix?: string;
  /** Book button label */
  bookButtonText?: string;
  /** Display locale for occasion title and look */
  locale?: 'ar' | 'en';
}

export function GrandmotherPackageCard({
  occasion,
  grandmaName,
  onBook,
  className = '',
  includesTitle = ' تشمل الباقة',
  include1 = '• مكياج راقٍ',
  include2 = '• تسريحة',
  include3 = '• مانيكير',
  include4 = '• ضيافة',
  include5 = '• وقت إضافي',
  include6 = '• صورة تذكارية',
  currencySuffix = 'ر.س',
  bookButtonText = 'احجزي',
  locale = 'ar',
}: GrandmotherPackageCardProps): JSX.Element {
  const o = OCCASIONS[occasion];

  return (
    <div
      className={cn(
        'rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-yellow-50 p-5 dark:border-amber-900 dark:from-amber-950 dark:to-yellow-950',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true"></span>
        <h4 className="mt-1 text-sm font-bold text-amber-800 dark:text-amber-200">
          {o.title[locale]}
        </h4>
        <p className="text-[10px] text-amber-600 dark:text-amber-400">
          {grandmaName ? `${grandmaName} — ` : ''}
          {o.look[locale]}
        </p>
      </div>

      <div className="mt-3 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <p className="text-[10px] font-bold text-amber-800 dark:text-amber-200">{includesTitle}</p>
        <div className="mt-1 grid grid-cols-2 gap-1 text-[10px] text-amber-700 dark:text-amber-300">
          <span>{include1}</span>
          <span>{include2}</span>
          <span>{include3}</span>
          <span>{include4}</span>
          <span>{include5}</span>
          <span>{include6}</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-lg font-bold text-amber-800 dark:text-amber-200">
          {o.price} {currencySuffix}
        </p>
        <button
          type="button"
          onClick={onBook}
          className="rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-amber-700 active:scale-[0.98] transition-all"
        >
          {bookButtonText}
        </button>
      </div>
    </div>
  );
}
