'use client';

import { cn } from '@galaxy/shared';

/**
 * Student Discount Badge — 15% off for university students.
 * From Phase W5: Financial Empowerment — Student Discount.
 *
 * Usage:
 *   <StudentDiscountBadge discount={15} />
 */

interface StudentDiscountBadgeProps {
  /** Discount percentage */
  discount?: number;
  /** University name */
  university?: string;
  /** Requires .edu.sa email verification */
  requiresVerification?: boolean;
  /** Original price before discount */
  originalPrice?: number;
  className?: string;
}

export function StudentDiscountBadge({
  discount = 15,
  university,
  requiresVerification = true,
  originalPrice,
  className = '',
}: StudentDiscountBadgeProps): JSX.Element {
  const discountedPrice = originalPrice ? Math.round(originalPrice * (1 - discount / 100)) : null;

  return (
    <div
      className={cn(
        'rounded-2xl border border-orange-100 bg-white p-4 dark:border-orange-900 dark:bg-gray-900',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">
            
          </span>
          <div>
            <h4 className="text-sm font-bold text-orange-700 dark:text-orange-300">خصم الطالبات</h4>
            <p className="text-[10px] text-orange-500 dark:text-orange-400">
              {discount}% خصم لطالبات الجامعة
            </p>
          </div>
        </div>
        <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-700 dark:bg-orange-950 dark:text-orange-300">
          -{discount}%
        </span>
      </div>

      {/* Price comparison */}
      {originalPrice && discountedPrice && (
        <div className="mt-3 flex items-center justify-center gap-3 rounded-xl bg-orange-50 p-3 dark:bg-orange-950">
          <div className="text-center">
            <p className="text-[10px] text-text-tertiary dark:text-gray-500">السعر الأصلي</p>
            <p className="text-sm text-text-tertiary line-through dark:text-gray-400">
              {originalPrice} ر.س
            </p>
          </div>
          <span className="text-orange-400" aria-hidden="true">
            →
          </span>
          <div className="text-center">
            <p className="text-[10px] text-orange-600 dark:text-orange-400">سعر الطالبات</p>
            <p className="text-lg font-bold text-orange-700 dark:text-orange-300">
              {discountedPrice} ر.س
            </p>
          </div>
        </div>
      )}

      {/* University */}
      {university && (
        <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-orange-50 px-2.5 py-1.5 dark:bg-orange-950">
          <span className="text-xs" aria-hidden="true">
            ️
          </span>
          <span className="text-[10px] text-orange-700 dark:text-orange-300">{university}</span>
        </div>
      )}

      {/* Verification */}
      {requiresVerification && (
        <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-amber-50 p-2 dark:bg-amber-950">
          <span className="text-xs shrink-0" aria-hidden="true">
            
          </span>
          <div>
            <p className="text-[10px] font-bold text-amber-700 dark:text-amber-300">
              مطلوب بريد جامعي (.edu.sa)
            </p>
            <p className="text-[10px] text-amber-600 dark:text-amber-400">
              أدخلي بريدكِ الجامعي للتحقق من أهليتكِ للخصم
            </p>
          </div>
        </div>
      )}

      {/* CTA */}
      <button
        type="button"
        className="mt-3 w-full rounded-xl bg-orange-600 py-2 text-xs font-bold text-white hover:bg-orange-700 active:scale-[0.98] transition-all"
      >
        تحققي من أهليتكِ 
      </button>

      {/* Footer */}
      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
         الجمال للجميع — بما فيهن الطالبات
      </p>
    </div>
  );
}
