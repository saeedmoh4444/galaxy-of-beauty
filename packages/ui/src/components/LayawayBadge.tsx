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
  /** Card heading */
  title?: string;
  /** Prefix before the installments count */
  installmentsPrefix?: string;
  /** Suffix after the installments count */
  installmentsSuffix?: string;
  /** Reserved badge label */
  reservedText?: string;
  /** Total price label */
  totalLabel?: string;
  /** Per-installment amount label */
  installmentLabel?: string;
  /** Installments count label */
  installmentsLabel?: string;
  /** Currency suffix for amounts */
  currencySuffix?: string;
  /** Prefix before the installments count in progress */
  ofPrefix?: string;
  /** Unit after the installments count in progress */
  installmentsUnit?: string;
  /** Prefix before the remaining count */
  remainingPrefix?: string;
  /** Suffix after the remaining count */
  remainingSuffix?: string;
  /** Text when fully paid */
  completedText?: string;
  /** Prefix before the next payment date */
  nextPaymentPrefix?: string;
  /** Footer text */
  footerText?: string;
}

export function LayawayBadge({
  totalPrice,
  installments,
  installmentAmount,
  remaining,
  nextPaymentDate,
  isReserved = false,
  className = '',
  title = 'احجزي الآن وادفعي لاحقاً',
  installmentsPrefix = 'قسطي على ',
  installmentsSuffix = ' دفعات بدون فوائد',
  reservedText = 'محجوزة',
  totalLabel = 'الإجمالي',
  installmentLabel = 'الدفعة',
  installmentsLabel = 'الدفعات',
  currencySuffix = 'ر.س',
  ofPrefix = 'من ',
  installmentsUnit = 'دفعة',
  remainingPrefix = 'متبقي ',
  remainingSuffix = 'دفعات',
  completedText = ' مكتمل!',
  nextPaymentPrefix = 'الدفعة القادمة: ',
  footerText = 'بدون فوائد، بدون رسوم خفية — الجمال للجميع',
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
            <h4 className="text-sm font-bold text-violet-700 dark:text-violet-300">{title}</h4>
            <p className="text-[10px] text-violet-500 dark:text-violet-400">
              {installmentsPrefix}
              {installments}
              {installmentsSuffix}
            </p>
          </div>
        </div>
        {isReserved && (
          <span className="shrink-0 rounded-full bg-violet-100 px-2.5 py-0.5 text-[10px] font-bold text-violet-700 dark:bg-violet-950 dark:text-violet-300">
            {reservedText}
          </span>
        )}
      </div>

      {/* Price breakdown */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-violet-50 p-2 dark:bg-violet-950">
          <p className="text-[10px] text-violet-500 dark:text-violet-400">{totalLabel}</p>
          <p className="text-sm font-bold text-violet-800 dark:text-violet-200">
            {totalPrice} {currencySuffix}
          </p>
        </div>
        <div className="rounded-xl bg-violet-50 p-2 dark:bg-violet-950">
          <p className="text-[10px] text-violet-500 dark:text-violet-400">{installmentLabel}</p>
          <p className="text-sm font-bold text-violet-800 dark:text-violet-200">
            {installmentAmount} {currencySuffix}
          </p>
        </div>
        <div className="rounded-xl bg-violet-50 p-2 dark:bg-violet-950">
          <p className="text-[10px] text-violet-500 dark:text-violet-400">{installmentsLabel}</p>
          <p className="text-sm font-bold text-violet-800 dark:text-violet-200">{installments}x</p>
        </div>
      </div>

      {/* Progress bar for active layaway */}
      {remaining !== undefined && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-violet-600 dark:text-violet-400">
              {paid} {ofPrefix}
              {installments} {installmentsUnit}
            </span>
            <span className="font-bold text-violet-700 dark:text-violet-300">
              {remaining > 0 ? `${remainingPrefix}${remaining} ${remainingSuffix}` : completedText}
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
            {nextPaymentPrefix}
            {nextPaymentDate}
          </span>
        </div>
      )}

      {/* Zero-interest pledge */}
      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        {footerText}
      </p>
    </div>
  );
}
