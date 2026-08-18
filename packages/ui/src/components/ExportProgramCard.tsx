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
  title?: string;
  subtitle?: string;
  productLabel?: string;
  countryLabel?: string;
  offerLabel?: string;
  item1?: string;
  item2?: string;
  item3?: string;
  exportButtonText?: string;
  className?: string;
}

export function ExportProgramCard({
  products,
  countries,
  onLearnMore,
  className = '',
  title = 'برنامج التصدير',
  subtitle = 'منتجات سعودية إلى العالم',
  productLabel = 'منتج سعودي',
  countryLabel = 'دولة',
  offerLabel = ' نقدم لكِ',
  item1 = '• شهادات مطابقة دولية',
  item2 = '• دعم لوجستي وشحن',
  item3 = '• تسجيل في الأسواق العالمية',
  exportButtonText = 'صدري منتجكِ',
}: ExportProgramCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50 p-5 dark:border-emerald-900 dark:from-emerald-950 dark:to-green-950',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true"></span>
        <h4 className="mt-1 text-sm font-bold text-emerald-800 dark:text-emerald-200">{title}</h4>
        <p className="text-[10px] text-emerald-600 dark:text-emerald-400">{subtitle}</p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white/60 p-3 text-center dark:bg-gray-800/60">
          <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">{products}</p>
          <p className="text-[9px] text-emerald-600 dark:text-emerald-400">{productLabel}</p>
        </div>
        <div className="rounded-xl bg-white/60 p-3 text-center dark:bg-gray-800/60">
          <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">{countries}</p>
          <p className="text-[9px] text-emerald-600 dark:text-emerald-400">{countryLabel}</p>
        </div>
      </div>

      <div className="mt-2 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-200">{offerLabel}</p>
        <div className="mt-1 space-y-0.5 text-[10px] text-emerald-700 dark:text-emerald-300">
          <p>{item1}</p>
          <p>{item2}</p>
          <p>{item3}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onLearnMore}
        className="mt-3 w-full rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-700 active:scale-[0.98] transition-all"
      >
        {exportButtonText}
      </button>
    </div>
  );
}
