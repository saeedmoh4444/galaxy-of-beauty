'use client';

import { cn } from '@galaxy/shared';

/**
 * Tax Helper Card — ZATCA-compliant revenue reports for women entrepreneurs.
 * From Phase W5: Financial Empowerment — Technician Entrepreneurship.
 *
 * Usage:
 *   <TaxHelperCard revenue={{ monthly: 8500, vat: 1275 }} />
 */

interface TaxHelperCardProps {
  revenue: {
    monthly: number;
    vat: number;
  };
  quarter?: string;
  previousQuarter?: number;
  onDownloadReport?: () => void;
  className?: string;
  /** Card heading */
  title?: string;
  /** Subtitle under the heading */
  subtitle?: string;
  /** Monthly revenue label */
  monthlyRevenueLabel?: string;
  /** VAT label */
  vatLabel?: string;
  /** Currency suffix for amounts */
  currencySuffix?: string;
  /** Prefix before a positive growth percentage */
  growthPositivePrefix?: string;
  /** Prefix before a negative growth percentage */
  growthNegativePrefix?: string;
  /** Prefix before the quarter name */
  comparedPrefix?: string;
  /** Download report button label */
  downloadButtonText?: string;
  /** Details button label */
  detailsButtonText?: string;
  /** Footer text */
  footerText?: string;
}

export function TaxHelperCard({
  revenue,
  quarter = 'الربع الحالي',
  previousQuarter,
  onDownloadReport,
  className = '',
  title = 'مساعد الزكاة والضرائب',
  subtitle = 'تقارير جاهزة ومتوافقة مع هيئة الزكاة والضريبة والجمارك',
  monthlyRevenueLabel = 'الإيراد الشهري',
  vatLabel = 'ضريبة القيمة المضافة',
  currencySuffix = 'ر.س',
  growthPositivePrefix = ' نمو ',
  growthNegativePrefix = ' انخفاض ',
  comparedPrefix = ' عن ',
  downloadButtonText = 'تقرير ZATCA',
  detailsButtonText = 'التفاصيل',
  footerText = '️ متوافق مع متطلبات هيئة الزكاة والضريبة والجمارك السعودية',
}: TaxHelperCardProps): JSX.Element {
  const growth = previousQuarter
    ? Math.round(((revenue.monthly - previousQuarter) / previousQuarter) * 100)
    : null;

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

      {/* Revenue stats */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-emerald-50 p-3 text-center dark:bg-emerald-950">
          <p className="text-[9px] text-emerald-600 dark:text-emerald-400">{monthlyRevenueLabel}</p>
          <p className="text-lg font-bold text-emerald-800 dark:text-emerald-200">
            {revenue.monthly.toLocaleString('ar-SA')} {currencySuffix}
          </p>
        </div>
        <div className="rounded-xl bg-emerald-50 p-3 text-center dark:bg-emerald-950">
          <p className="text-[9px] text-emerald-600 dark:text-emerald-400">{vatLabel}</p>
          <p className="text-lg font-bold text-amber-700 dark:text-amber-300">
            {revenue.vat.toLocaleString('ar-SA')} {currencySuffix}
          </p>
        </div>
      </div>

      {/* Growth */}
      {growth !== null && (
        <div className="mt-2 rounded-lg bg-white/60 p-2 text-center dark:bg-gray-800/60">
          <p
            className={cn(
              'text-[10px] font-bold',
              growth >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400',
            )}
          >
            {growth >= 0
              ? `${growthPositivePrefix}${growth}%`
              : `${growthNegativePrefix}${Math.abs(growth)}%`}
            {comparedPrefix}
            {quarter}
          </p>
        </div>
      )}

      {/* Quarter info */}
      <div className="mt-2 rounded-lg bg-emerald-50 p-2 text-center dark:bg-emerald-950">
        <p className="text-[10px] text-emerald-700 dark:text-emerald-300"> {quarter}</p>
      </div>

      {/* CTAs */}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onDownloadReport}
          className="flex-1 rounded-xl bg-emerald-600 py-2 text-[10px] font-bold text-white hover:bg-emerald-700 active:scale-[0.98] transition-all"
        >
          {downloadButtonText}
        </button>
        <button
          type="button"
          className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-[10px] font-bold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-gray-800 dark:text-emerald-300"
        >
          {detailsButtonText}
        </button>
      </div>

      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        {footerText}
      </p>
    </div>
  );
}
