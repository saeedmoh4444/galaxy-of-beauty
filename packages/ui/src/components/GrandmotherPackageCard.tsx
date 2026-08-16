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
  title: string;
  look: string;
  price: number;
}

const OCCASIONS: Record<Occasion, OccasionDef> = {
  wedding: { emoji: '', title: 'جدة العروس', look: 'مكياج كلاسيكي + تسريحة أنيقة', price: 350 },
  graduation: { emoji: '', title: 'جدة الخريجة', look: 'مكياج ناعم + لمسة أناقة', price: 250 },
  aqeeqah: { emoji: '', title: 'جدة المولود', look: 'إطلالة دافئة ومبهجة', price: 200 },
  eid: { emoji: '', title: 'إطلالة العيد', look: 'مكياج راقٍ + تسريحة تقليدية', price: 300 },
};

interface GrandmotherPackageCardProps {
  occasion: Occasion;
  grandmaName?: string;
  onBook?: () => void;
  className?: string;
}

export function GrandmotherPackageCard({
  occasion,
  grandmaName,
  onBook,
  className = '',
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
        <h4 className="mt-1 text-sm font-bold text-amber-800 dark:text-amber-200">{o.title}</h4>
        <p className="text-[10px] text-amber-600 dark:text-amber-400">
          {grandmaName ? `${grandmaName} — ` : ''}
          {o.look}
        </p>
      </div>

      <div className="mt-3 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <p className="text-[10px] font-bold text-amber-800 dark:text-amber-200"> تشمل الباقة</p>
        <div className="mt-1 grid grid-cols-2 gap-1 text-[10px] text-amber-700 dark:text-amber-300">
          <span>• مكياج راقٍ</span>
          <span>• تسريحة</span>
          <span>• مانيكير</span>
          <span>• ضيافة</span>
          <span>• وقت إضافي</span>
          <span>• صورة تذكارية</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-lg font-bold text-amber-800 dark:text-amber-200">{o.price} ر.س</p>
        <button
          type="button"
          onClick={onBook}
          className="rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-amber-700 active:scale-[0.98] transition-all"
        >
          احجزي
        </button>
      </div>
    </div>
  );
}
