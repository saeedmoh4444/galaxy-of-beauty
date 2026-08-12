'use client';

import { cn } from '@galaxy/shared';

/**
 * Rural Outreach Card — train and employ women from villages and small towns.
 * From Phase W10: Saudi Women Leadership — Rural Women Outreach.
 *
 * Usage:
 *   <RuralOutreachCard trained={87} employed={52} villages={14} />
 */

interface RuralOutreachCardProps {
  trained: number;
  employed: number;
  villages: number;
  target?: number;
  onLearnMore?: () => void;
  onDonate?: () => void;
  className?: string;
}

export function RuralOutreachCard({
  trained,
  employed,
  villages,
  target = 200,
  onLearnMore,
  onDonate,
  className = '',
}: RuralOutreachCardProps): JSX.Element {
  const employPct = Math.round((employed / target) * 100);

  return (
    <div
      className={cn(
        'rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50 p-5 dark:border-emerald-900 dark:from-emerald-950 dark:to-green-950',
        className,
      )}
    >
      {/* Header */}
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true">
          
        </span>
        <h4 className="mt-1 text-sm font-bold text-emerald-800 dark:text-emerald-200">
          تمكين المرأة الريفية
        </h4>
        <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
          نصل إلى النساء في القرى والمدن الصغيرة
        </p>
      </div>

      {/* Stats */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-white/60 p-3 text-center dark:bg-gray-800/60">
          <p className="text-lg" aria-hidden="true">
            
          </p>
          <p className="text-lg font-bold text-emerald-800 dark:text-emerald-200">{trained}</p>
          <p className="text-[9px] text-emerald-600 dark:text-emerald-400">متدربة</p>
        </div>
        <div className="rounded-xl bg-white/60 p-3 text-center dark:bg-gray-800/60">
          <p className="text-lg" aria-hidden="true">
            
          </p>
          <p className="text-lg font-bold text-emerald-800 dark:text-emerald-200">{employed}</p>
          <p className="text-[9px] text-emerald-600 dark:text-emerald-400">موظفة</p>
        </div>
        <div className="rounded-xl bg-white/60 p-3 text-center dark:bg-gray-800/60">
          <p className="text-lg" aria-hidden="true">
            
          </p>
          <p className="text-lg font-bold text-emerald-800 dark:text-emerald-200">{villages}</p>
          <p className="text-[9px] text-emerald-600 dark:text-emerald-400">قرية</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-3 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-emerald-700 dark:text-emerald-300">
             هدف توظيف {target} امرأة ريفية
          </span>
          <span className="font-bold text-emerald-800 dark:text-emerald-200">{employPct}%</span>
        </div>
        <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-900">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-1000"
            style={{ width: `${Math.min(100, employPct)}%` }}
          />
        </div>
      </div>

      {/* How it works */}
      <div className="mt-2 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-200">
           كيف نصل إليهن
        </p>
        <div className="mt-1 space-y-1 text-[10px] text-emerald-700 dark:text-emerald-300">
          <p>• عيادات متنقلة تزور القرى أسبوعياً</p>
          <p>• تدريب عن بعد عبر الجوال</p>
          <p>• شراكات مع جمعيات التنمية المحلية</p>
          <p>• توفير معدات تجميل مجانية للمتدربات</p>
        </div>
      </div>

      {/* CTAs */}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onLearnMore}
          className="flex-1 rounded-xl bg-emerald-600 py-2 text-[10px] font-bold text-white hover:bg-emerald-700 active:scale-[0.98] transition-all"
        >
          اعرفي المزيد
        </button>
        <button
          type="button"
          onClick={onDonate}
          className="flex-1 rounded-xl border border-emerald-200 bg-white py-2 text-[10px] font-bold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-gray-800 dark:text-emerald-300"
        >
           تبرعي
        </button>
      </div>

      <p className="mt-2 text-center text-[9px] text-emerald-600 dark:text-emerald-400">
         كل امرأة تستحق فرصة — أينما كانت
      </p>
    </div>
  );
}
