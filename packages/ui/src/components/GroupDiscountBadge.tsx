'use client';

import { cn } from '@galaxy/shared';

/**
 * Group Discount Badge — book together, save together.
 * From Phase W4: Sisterhood & Community — Beauty Circles (Group Discounts).
 *
 * Usage:
 *   <GroupDiscountBadge groupSize={3} discount={15} />
 */

interface GroupDiscountBadgeProps {
  /** Number of people booking together */
  groupSize: number;
  /** Discount percentage */
  discount?: number;
  serviceName?: string;
  originalPrice?: number;
  onInvite?: () => void;
  className?: string;
}

export function GroupDiscountBadge({
  groupSize,
  discount = 15,
  serviceName,
  originalPrice,
  onInvite,
  className = '',
}: GroupDiscountBadgeProps): JSX.Element {
  const priceAfterDiscount = originalPrice
    ? Math.round(originalPrice * (1 - discount / 100))
    : null;
  const savingsPerPerson =
    originalPrice && priceAfterDiscount ? originalPrice - priceAfterDiscount : null;

  return (
    <div
      className={cn(
        'rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-purple-50 p-5 dark:border-violet-900 dark:from-violet-950 dark:to-purple-950',
        className,
      )}
    >
      {/* Header */}
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true">
          ‍️
        </span>
        <h4 className="mt-1 text-sm font-bold text-violet-800 dark:text-violet-200">
          خصم المجموعة
        </h4>
        <p className="text-[10px] text-violet-500 dark:text-violet-400">
          احجزي مع صديقاتكِ ووفّري أكثر
        </p>
      </div>

      {/* Discount visual */}
      <div className="mt-3 rounded-xl bg-white/60 p-4 text-center dark:bg-gray-800/60">
        <div className="inline-flex items-baseline gap-1">
          <span className="text-3xl font-bold text-violet-700 dark:text-violet-300">
            {discount}%
          </span>
          <span className="text-sm font-bold text-violet-500 dark:text-violet-400">خصم</span>
        </div>
        <p className="mt-1 text-[10px] text-text-secondary dark:text-gray-300">
          عند حجز {groupSize} أشخاص معاً
        </p>
      </div>

      {/* Group size tiers */}
      <div className="mt-2 flex gap-1.5">
        {[
          { size: 2, off: 10 },
          { size: 3, off: 15 },
          { size: 5, off: 25 },
        ].map((tier) => (
          <div
            key={tier.size}
            className={cn(
              'flex-1 rounded-lg p-2 text-center transition-all',
              groupSize >= tier.size
                ? 'bg-violet-100 dark:bg-violet-900'
                : 'bg-white/40 dark:bg-gray-800/40',
            )}
          >
            <p className="text-[10px] font-bold text-text-primary dark:text-gray-100">
              {tier.size}+ 
            </p>
            <p className="text-[10px] font-bold text-violet-700 dark:text-violet-300">
              -{tier.off}%
            </p>
          </div>
        ))}
      </div>

      {/* Price comparison */}
      {originalPrice && priceAfterDiscount && savingsPerPerson && (
        <div className="mt-2 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
          {serviceName && (
            <p className="text-center text-[10px] font-bold text-text-primary dark:text-gray-100">
              {serviceName}
            </p>
          )}
          <div className="mt-1 flex items-center justify-center gap-2 text-[10px]">
            <span className="text-text-tertiary line-through dark:text-gray-500">
              {originalPrice} ر.س
            </span>
            <span className="text-violet-400">→</span>
            <span className="font-bold text-violet-700 dark:text-violet-300">
              {priceAfterDiscount} ر.س
            </span>
            <span className="text-emerald-600 dark:text-emerald-400">
              (وفر {savingsPerPerson} ر.س)
            </span>
          </div>
        </div>
      )}

      {/* CTA */}
      <button
        type="button"
        onClick={onInvite}
        className="mt-3 w-full rounded-xl bg-violet-600 py-2.5 text-xs font-bold text-white hover:bg-violet-700 active:scale-[0.98] transition-all shadow-sm"
      >
        ادعي صديقاتكِ 
      </button>

      <p className="mt-2 text-center text-[9px] text-violet-500 dark:text-violet-400">
         الجمال أحلى مع الصديقات
      </p>
    </div>
  );
}
