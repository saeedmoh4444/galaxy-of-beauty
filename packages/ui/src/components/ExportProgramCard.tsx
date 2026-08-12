'use client';

import { cn } from '@galaxy/shared';

/**
 * Export Program Card — Saudi beauty products export program for women entrepreneurs.
 * From Phase W10: Saudi Women Leadership.
 *
 * Usage:
 *   <ExportProgramCard products={12} countries={5} />
 */

interface ExportProgramCardProps {
  products: number;
  countries: number;
  onLearnMore?: () => void;
  className?: string;
}

export function ExportProgramCard({
  products,
  countries,
  onLearnMore,
  className = '',
}: ExportProgramCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50 p-5 dark:border-emerald-900 dark:from-emerald-950 dark:to-green-950',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true">
          
        </span>
        <h4 className="mt-1 text-sm font-bold text-emerald-800 dark:text-emerald-200">
          برنامج التصدير
        </h4>
        <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
          منتجات سعودية إلى العالم
        </p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white/60 p-3 text-center dark:bg-gray-800/60">
          <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">{products}</p>
          <p className="text-[9px] text-emerald-600 dark:text-emerald-400">منتج سعودي</p>
        </div>
        <div className="rounded-xl bg-white/60 p-3 text-center dark:bg-gray-800/60">
          <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">{countries}</p>
          <p className="text-[9px] text-emerald-600 dark:text-emerald-400">دولة</p>
        </div>
      </div>

      <div className="mt-2 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-200"> نقدم لكِ</p>
        <div className="mt-1 space-y-0.5 text-[10px] text-emerald-700 dark:text-emerald-300">
          <p>• شهادات مطابقة دولية</p>
          <p>• دعم لوجستي وشحن</p>
          <p>• تسجيل في الأسواق العالمية</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onLearnMore}
        className="mt-3 w-full rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-700 active:scale-[0.98] transition-all"
      >
        صدري منتجكِ 
      </button>
    </div>
  );
}
