'use client';

import { cn } from '@galaxy/shared';

/**
 * Investor Pitch Card — investor relations & pitch deck for women entrepreneurs.
 * From Phase W10: Saudi Women Leadership.
 *
 * Usage:
 *   <InvestorPitchCard startups={15} funded={8} totalRaised="٢ مليون" />
 */

interface InvestorPitchCardProps {
  startups: number;
  funded: number;
  totalRaised: string;
  onApply?: () => void;
  onInvest?: () => void;
  className?: string;
}

export function InvestorPitchCard({ startups, funded, totalRaised, onApply, onInvest, className = '' }: InvestorPitchCardProps): JSX.Element {
  return (
    <div className={cn('rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 dark:border-emerald-900 dark:from-emerald-950 dark:to-teal-950', className)}>
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true">💼</span>
        <h4 className="mt-1 text-sm font-bold text-emerald-800 dark:text-emerald-200">منصة الاستثمار</h4>
        <p className="text-[10px] text-emerald-600 dark:text-emerald-400">نربط رائدات الأعمال بالمستثمرين</p>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-white/60 p-2.5 text-center dark:bg-gray-800/60">
          <p className="text-lg font-bold text-emerald-800 dark:text-emerald-200">{startups}</p>
          <p className="text-[9px] text-emerald-600 dark:text-emerald-400">مشروع</p>
        </div>
        <div className="rounded-xl bg-white/60 p-2.5 text-center dark:bg-gray-800/60">
          <p className="text-lg font-bold text-emerald-800 dark:text-emerald-200">{funded}</p>
          <p className="text-[9px] text-emerald-600 dark:text-emerald-400">ممول</p>
        </div>
        <div className="rounded-xl bg-white/60 p-2.5 text-center dark:bg-gray-800/60">
          <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">{totalRaised}</p>
          <p className="text-[9px] text-emerald-600 dark:text-emerald-400">ريال</p>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button type="button" onClick={onApply} className="flex-1 rounded-xl bg-emerald-600 py-2 text-[10px] font-bold text-white hover:bg-emerald-700 active:scale-[0.98] transition-all">قدمي مشروعكِ</button>
        <button type="button" onClick={onInvest} className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-[10px] font-bold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-gray-800 dark:text-emerald-300">استثمري</button>
      </div>
    </div>
  );
}
