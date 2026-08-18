'use client';

import { cn } from '@galaxy/shared';

/**
 * Micro Loan Badge — bank partnerships for women beauty entrepreneurs.
 * From Phase W5: Financial Empowerment — Loan Access.
 *
 * Usage:
 *   <MicroLoanBadge maxAmount={50000} interestRate={0} />
 */

interface MicroLoanBadgeProps {
  maxAmount?: number;
  interestRate?: number;
  partnerBank?: string;
  onLearnMore?: () => void;
  className?: string;
  /** Card heading */
  title?: string;
  /** Subtitle under the heading */
  subtitle?: string;
  /** Label above the max amount */
  upToLabel?: string;
  /** Currency suffix for amounts */
  currencySuffix?: string;
  /** Interest rate stat label */
  interestRateLabel?: string;
  /** Prefix before the partner bank name */
  partnerPrefix?: string;
  /** Financing benefit bullets */
  benefit1?: string;
  benefit2?: string;
  benefit3?: string;
  benefit4?: string;
  /** Apply button label */
  applyButtonText?: string;
  /** Footer text */
  footerText?: string;
}

export function MicroLoanBadge({
  maxAmount = 50000,
  interestRate = 0,
  partnerBank = 'بنك التنمية الاجتماعية',
  onLearnMore,
  className = '',
  title = 'تمويل المشاريع الصغيرة',
  subtitle = 'قروض ميسرة لرائدات الأعمال في التجميل',
  upToLabel = 'حتى',
  currencySuffix = 'ر.س',
  interestRateLabel = 'نسبة الفائدة',
  partnerPrefix = 'بالشراكة مع ',
  benefit1 = '• بدون فوائد — تمويل متوافق مع الشريعة',
  benefit2 = '• فترة سماح 6 أشهر',
  benefit3 = '• استشارة مجانية لخطة العمل',
  benefit4 = '• دعم فني لمدة سنة كاملة',
  applyButtonText = 'تقديم على التمويل',
  footerText = 'ندعم حلمكِ — من فكرة إلى مشروع',
}: MicroLoanBadgeProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-emerald-100 bg-white p-4 dark:border-emerald-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true"></span>
        <div>
          <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{title}</h4>
          <p className="text-[10px] text-emerald-500 dark:text-emerald-400">{subtitle}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-emerald-50 p-3 text-center dark:bg-emerald-950">
          <p className="text-[9px] text-emerald-600 dark:text-emerald-400">{upToLabel}</p>
          <p className="text-lg font-bold text-emerald-800 dark:text-emerald-200">
            {maxAmount.toLocaleString('ar-SA')} {currencySuffix}
          </p>
        </div>
        <div className="rounded-xl bg-emerald-50 p-3 text-center dark:bg-emerald-950">
          <p className="text-[9px] text-emerald-600 dark:text-emerald-400">{interestRateLabel}</p>
          <p className="text-lg font-bold text-emerald-800 dark:text-emerald-200">
            {interestRate}%
          </p>
        </div>
      </div>

      <div className="mt-2 rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950">
        <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-200">
          {partnerPrefix}
          {partnerBank}
        </p>
        <div className="mt-1.5 space-y-0.5 text-[10px] text-emerald-700 dark:text-emerald-300">
          <p>{benefit1}</p>
          <p>{benefit2}</p>
          <p>{benefit3}</p>
          <p>{benefit4}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onLearnMore}
        className="mt-3 w-full rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-700 active:scale-[0.98] transition-all"
      >
        {applyButtonText}
      </button>

      <p className="mt-1.5 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        {footerText}
      </p>
    </div>
  );
}
