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
}

export function MicroLoanBadge({
  maxAmount = 50000,
  interestRate = 0,
  partnerBank = 'بنك التنمية الاجتماعية',
  onLearnMore,
  className = '',
}: MicroLoanBadgeProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-emerald-100 bg-white p-4 dark:border-emerald-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true">
          
        </span>
        <div>
          <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
            تمويل المشاريع الصغيرة
          </h4>
          <p className="text-[10px] text-emerald-500 dark:text-emerald-400">
            قروض ميسرة لرائدات الأعمال في التجميل
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-emerald-50 p-3 text-center dark:bg-emerald-950">
          <p className="text-[9px] text-emerald-600 dark:text-emerald-400">حتى</p>
          <p className="text-lg font-bold text-emerald-800 dark:text-emerald-200">
            {maxAmount.toLocaleString('ar-SA')} ر.س
          </p>
        </div>
        <div className="rounded-xl bg-emerald-50 p-3 text-center dark:bg-emerald-950">
          <p className="text-[9px] text-emerald-600 dark:text-emerald-400">نسبة الفائدة</p>
          <p className="text-lg font-bold text-emerald-800 dark:text-emerald-200">
            {interestRate}%
          </p>
        </div>
      </div>

      <div className="mt-2 rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950">
        <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-200">
           بالشراكة مع {partnerBank}
        </p>
        <div className="mt-1.5 space-y-0.5 text-[10px] text-emerald-700 dark:text-emerald-300">
          <p>• بدون فوائد — تمويل متوافق مع الشريعة</p>
          <p>• فترة سماح 6 أشهر</p>
          <p>• استشارة مجانية لخطة العمل</p>
          <p>• دعم فني لمدة سنة كاملة</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onLearnMore}
        className="mt-3 w-full rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-700 active:scale-[0.98] transition-all"
      >
        تقديم على التمويل 
      </button>

      <p className="mt-1.5 text-center text-[9px] text-text-tertiary dark:text-gray-500">
         ندعم حلمكِ — من فكرة إلى مشروع
      </p>
    </div>
  );
}
