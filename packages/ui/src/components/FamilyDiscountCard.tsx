'use client';

import { cn } from '@galaxy/shared';

/**
 * Family Discount Card — family booking discount for 3+ members.
 * From Phase W7: Mother-Daughter & Family.
 *
 * Usage:
 *   <FamilyDiscountCard familySize={4} discount={20} />
 */

interface FamilyDiscountCardProps {
  familySize: number;
  discount?: number;
  familyName?: string;
  onBook?: () => void;
  className?: string;
}

export function FamilyDiscountCard({
  familySize,
  discount = 20,
  familyName,
  onBook,
  className = '',
}: FamilyDiscountCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 dark:border-emerald-900 dark:from-emerald-950 dark:to-teal-950',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true">
          ‍‍‍
        </span>
        <h4 className="mt-1 text-sm font-bold text-emerald-800 dark:text-emerald-200">
          خصم العائلة
        </h4>
        <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
          {familyName ? `عائلة ${familyName} — ` : ''}خصم {discount}% لـ {familySize} أفراد فأكثر
        </p>
      </div>

      {/* Family size tiers */}
      <div className="mt-3 flex gap-1.5">
        {[
          { size: 3, off: 15 },
          { size: 4, off: 20 },
          { size: 5, off: 30 },
        ].map((tier) => (
          <div
            key={tier.size}
            className={cn(
              'flex-1 rounded-lg p-2 text-center transition-all',
              familySize >= tier.size
                ? 'bg-white/80 dark:bg-gray-800/80'
                : 'bg-white/30 dark:bg-gray-800/30 opacity-50',
            )}
          >
            <p className="text-[10px] font-bold text-text-primary dark:text-gray-100">
              {tier.size} أفراد
            </p>
            <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
              -{tier.off}%
            </p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onBook}
        className="mt-3 w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 active:scale-[0.98] transition-all"
      >
        احجزي للعائلة
      </button>

      <p className="mt-2 text-center text-[9px] text-emerald-600 dark:text-emerald-400">
        ‍‍‍ الجمال يجمع العائلة
      </p>
    </div>
  );
}
