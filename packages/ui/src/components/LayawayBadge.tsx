'use client';

import { cn } from '@galaxy/shared';

/**
 * Layaway Badge — reserve a premium service and pay in installments.
 * From Phase W5: Financial Empowerment — Layaway.
 *
 * Usage:
 *   <LayawayBadge totalPrice={600} installments={3} installmentAmount={200} />
 */

interface LayawayBadgeProps {
  /** Total service price in SAR */
  totalPrice: number;
  /** Number of installments */
  installments: number;
  /** Amount per installment in SAR */
  installmentAmount: number;
  /** Remaining installments */
  remaining?: number;
  /** Next payment date */
  nextPaymentDate?: string;
  /** Already reserved */
  isReserved?: boolean;
  className?: string;
}

export function LayawayBadge({
  totalPrice,
  installments,
  installmentAmount,
  remaining,
  nextPaymentDate,
  isReserved = false,
  className = '',
}: LayawayBadgeProps): JSX.Element {
  const paid = installments - (remaining ?? installments);
  const progress = remaining !== undefined ? Math.round((paid / installments) * 100) : 0;

  return (
    <div
      className={cn(
        'rounded-2xl border border-violet-100 bg-white p-4 dark:border-violet-900 dark:bg-gray-900',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">
            ️
          </span>
          <div>
            <h4 className="text-sm font-bold text-violet-700 dark:text-violet-300">
              احجزي الآن وادفعي لاحقاً
            </h4>
            <p className="text-[10px] text-violet-500 dark:text-violet-400">
              قسطي على {installments} دفعات بدون فوائد
            </p>
          </div>
        </div>
        {isReserved && (
          <span className="shrink-0 rounded-full bg-violet-100 px-2.5 py-0.5 text-[10px] font-bold text-violet-700 dark:bg-violet-950 dark:text-violet-300">
            محجوزة
          </span>
        )}
      </div>

      {/* Price breakdown */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-violet-50 p-2 dark:bg-violet-950">
          <p className="text-[10px] text-violet-500 dark:text-violet-400">الإجمالي</p>
          <p className="text-sm font-bold text-violet-800 dark:text-violet-200">{totalPrice} ر.س</p>
        </div>
        <div className="rounded-xl bg-violet-50 p-2 dark:bg-violet-950">
          <p className="text-[10px] text-violet-500 dark:text-violet-400">الدفعة</p>
          <p className="text-sm font-bold text-violet-800 dark:text-violet-200">
            {installmentAmount} ر.س
          </p>
        </div>
        <div className="rounded-xl bg-violet-50 p-2 dark:bg-violet-950">
          <p className="text-[10px] text-violet-500 dark:text-violet-400">الدفعات</p>
          <p className="text-sm font-bold text-violet-800 dark:text-violet-200">{installments}x</p>
        </div>
      </div>

      {/* Progress bar for active layaway */}
      {remaining !== undefined && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-violet-600 dark:text-violet-400">
              {paid} من {installments} دفعة
            </span>
            <span className="font-bold text-violet-700 dark:text-violet-300">
              {remaining > 0 ? `متبقي ${remaining} دفعات` : ' مكتمل!'}
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-violet-100 dark:bg-violet-950">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-400 to-purple-500 transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Next payment */}
      {nextPaymentDate && remaining && remaining > 0 && (
        <div className="mt-2 flex items-center gap-2 rounded-lg bg-amber-50 px-2.5 py-1.5 dark:bg-amber-950">
          <span className="text-xs" aria-hidden="true"></span>
          <span className="text-[10px] text-amber-700 dark:text-amber-300">
            الدفعة القادمة: {nextPaymentDate}
          </span>
        </div>
      )}

      {/* Zero-interest pledge */}
      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        بدون فوائد، بدون رسوم خفية — الجمال للجميع
      </p>
    </div>
  );
}
