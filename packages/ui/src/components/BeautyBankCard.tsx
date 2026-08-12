'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Bank Card — community-funded services for women in need.
 * From Phase W8: Accessibility & Inclusivity — Financial Accessibility.
 * Also ties to W10: Social Impact — Domestic Violence Support.
 *
 * Usage:
 *   <BeautyBankCard funded={127} goal={200} onPassForward={() => {}} />
 */

interface BeautyBankCardProps {
  /** Number of services funded by community */
  funded: number;
  /** Monthly goal */
  goal: number;
  /** Number of women currently on waitlist */
  waitlist?: number;
  onPassForward?: () => void;
  className?: string;
}

export function BeautyBankCard({
  funded,
  goal,
  waitlist,
  onPassForward,
  className = '',
}: BeautyBankCardProps): JSX.Element {
  const pct = Math.min(100, Math.round((funded / goal) * 100));

  return (
    <div
      className={cn(
        'rounded-2xl border border-pink-100 bg-gradient-to-br from-pink-50 to-rose-50 p-5 dark:border-pink-900 dark:from-pink-950 dark:to-rose-950',
        className,
      )}
    >
      {/* Heart icon */}
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true">
          
        </span>
        <h4 className="mt-1 text-sm font-bold text-pink-800 dark:text-pink-200">بنك الجمال</h4>
        <p className="text-[10px] text-pink-600 dark:text-pink-400">
          المجتمع يمكّن المجتمع — ادفعي الثمن لامرأة لا تستطيع
        </p>
      </div>

      {/* Progress */}
      <div className="mt-3 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-pink-700 dark:text-pink-300">
             خدمات ممولة هذا الشهر
          </span>
          <span className="text-xs font-bold text-pink-700 dark:text-pink-300">{pct}%</span>
        </div>

        <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-pink-100 dark:bg-pink-900">
          <div
            className="h-full rounded-full bg-gradient-to-r from-pink-400 to-rose-500 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-lg font-bold text-pink-800 dark:text-pink-200">{funded}</span>
          <span className="text-[10px] text-pink-500 dark:text-pink-400">الهدف {goal}</span>
        </div>
      </div>

      {/* Waitlist */}
      {waitlist !== undefined && waitlist > 0 && (
        <div className="mt-2 rounded-xl bg-white/60 p-2.5 dark:bg-gray-800/60">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-text-secondary dark:text-gray-300">
               نساء بانتظار المساعدة
            </span>
            <span className="text-xs font-bold text-rose-700 dark:text-rose-400">
              {waitlist} امرأة
            </span>
          </div>
        </div>
      )}

      {/* Impact examples */}
      <div className="mt-2 space-y-1">
        <p className="text-[10px] font-bold text-pink-700 dark:text-pink-300"> كيف تساعدين</p>
        <div className="grid grid-cols-3 gap-1.5 text-center text-[9px]">
          <div className="rounded-lg bg-white/60 p-2 dark:bg-gray-800/60">
            <p className="text-lg" aria-hidden="true">
              
            </p>
            <p className="font-bold text-pink-800 dark:text-pink-200">50 ر.س</p>
            <p className="text-pink-500 dark:text-pink-400">قصة شعر</p>
          </div>
          <div className="rounded-lg bg-white/60 p-2 dark:bg-gray-800/60">
            <p className="text-lg" aria-hidden="true">
              
            </p>
            <p className="font-bold text-pink-800 dark:text-pink-200">150 ر.س</p>
            <p className="text-pink-500 dark:text-pink-400">مكياج مقابلة</p>
          </div>
          <div className="rounded-lg bg-white/60 p-2 dark:bg-gray-800/60">
            <p className="text-lg" aria-hidden="true">
              
            </p>
            <p className="font-bold text-pink-800 dark:text-pink-200">300 ر.س</p>
            <p className="text-pink-500 dark:text-pink-400">يوم سبا</p>
          </div>
        </div>
      </div>

      {/* Pass it forward CTA */}
      <button
        type="button"
        onClick={onPassForward}
        className="mt-3 w-full rounded-xl bg-pink-600 py-2.5 text-xs font-bold text-white hover:bg-pink-700 active:scale-[0.98] transition-all shadow-sm shadow-pink-200 dark:shadow-pink-900"
      >
         ادفعي الثمن لأخت
      </button>

      {/* Impact stories link */}
      <p className="mt-2 text-center text-[9px] text-pink-500 dark:text-pink-400 underline cursor-pointer">
         اقرئي قصص النساء اللواتي ساعدناها
      </p>
    </div>
  );
}
