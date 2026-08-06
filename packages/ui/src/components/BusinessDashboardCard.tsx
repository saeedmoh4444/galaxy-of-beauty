'use client';

import { cn } from '@galaxy/shared';

/**
 * Business Dashboard Card — mini revenue & expense dashboard for technicians.
 * From Phase W5: Financial Empowerment — Technician Entrepreneurship.
 *
 * Usage:
 *   <BusinessDashboardCard revenue={{ month: 8500, previous: 7200 }} expenses={3200} />
 */

interface BusinessDashboardCardProps {
  revenue: { month: number; previous: number };
  expenses: number;
  month?: string;
  onViewFull?: () => void;
  className?: string;
}

export function BusinessDashboardCard({
  revenue,
  expenses,
  month = 'هذا الشهر',
  onViewFull,
  className = '',
}: BusinessDashboardCardProps): JSX.Element {
  const profit = revenue.month - expenses;
  const margin = Math.round((profit / revenue.month) * 100);
  const growth = Math.round(((revenue.month - revenue.previous) / revenue.previous) * 100);

  return (
    <div
      className={cn(
        'rounded-2xl border border-emerald-100 bg-white p-4 dark:border-emerald-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">📊</span>
          <div>
            <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
              لوحة الأعمال
            </h4>
            <p className="text-[10px] text-emerald-500 dark:text-emerald-400">
              {month}
            </p>
          </div>
        </div>
        <span className={cn(
          'rounded-full px-2 py-0.5 text-[10px] font-bold',
          growth >= 0
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
            : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
        )}>
          {growth >= 0 ? '📈' : '📉'} {growth}%
        </span>
      </div>

      {/* KPIs */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-emerald-50 p-2.5 text-center dark:bg-emerald-950">
          <p className="text-[9px] text-emerald-600 dark:text-emerald-400">الإيراد</p>
          <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
            {revenue.month.toLocaleString('ar-SA')}
          </p>
        </div>
        <div className="rounded-xl bg-rose-50 p-2.5 text-center dark:bg-rose-950">
          <p className="text-[9px] text-rose-600 dark:text-rose-400">المصروفات</p>
          <p className="text-sm font-bold text-rose-800 dark:text-rose-200">
            {expenses.toLocaleString('ar-SA')}
          </p>
        </div>
        <div className="rounded-xl bg-blue-50 p-2.5 text-center dark:bg-blue-950">
          <p className="text-[9px] text-blue-600 dark:text-blue-400">الربح</p>
          <p className="text-sm font-bold text-blue-800 dark:text-blue-200">
            {profit.toLocaleString('ar-SA')}
          </p>
        </div>
      </div>

      {/* Profit margin bar */}
      <div className="mt-2">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-text-tertiary dark:text-gray-500">هامش الربح</span>
          <span className="font-bold text-emerald-700 dark:text-emerald-300">{margin}%</span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all"
            style={{ width: `${Math.min(100, margin)}%` }}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onViewFull}
        className="mt-3 w-full rounded-lg border border-emerald-200 py-1.5 text-[10px] font-bold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300"
      >
        📊 التقرير الكامل
      </button>
    </div>
  );
}
