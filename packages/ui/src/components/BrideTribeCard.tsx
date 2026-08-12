'use client';

import { cn } from '@galaxy/shared';

/**
 * Bride Tribe Card — coordinated looks for bridesmaids.
 * From Phase W7: Mother-Daughter & Family — Friends Who Slay Together.
 *
 * Usage:
 *   <BrideTribeCard bride="سارة" bridesmaids={['نورة', 'مها', 'ريم']} />
 */

interface Bridesmaid {
  name: string;
  role?: string;
  lookAssigned?: boolean;
}

interface BrideTribeCardProps {
  bride: string;
  bridesmaids: Bridesmaid[];
  weddingDate?: string;
  totalPrice?: number;
  pricePerPerson?: number;
  onCoordinate?: () => void;
  className?: string;
}

export function BrideTribeCard({
  bride,
  bridesmaids,
  weddingDate,
  totalPrice = 1800,
  pricePerPerson = 300,
  onCoordinate,
  className = '',
}: BrideTribeCardProps): JSX.Element {
  const assigned = bridesmaids.filter((b) => b.lookAssigned).length;

  return (
    <div
      className={cn(
        'rounded-2xl border border-rose-100 bg-white p-5 dark:border-rose-900 dark:bg-gray-900',
        className,
      )}
    >
      {/* Header */}
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true">
          ‍️
        </span>
        <h4 className="mt-1 text-sm font-bold text-rose-700 dark:text-rose-300">قبيلة العروس</h4>
        <p className="text-[10px] text-rose-500 dark:text-rose-400">إطلالات متناسقة لكل وصيفاتكِ</p>
      </div>

      {/* Bride */}
      <div className="mt-3 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 p-3 dark:from-rose-950 dark:to-pink-950">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden="true">
            
          </span>
          <div>
            <p className="text-xs font-bold text-text-primary dark:text-gray-100">{bride}</p>
            <p className="text-[10px] text-rose-600 dark:text-rose-400">العروس </p>
          </div>
          {weddingDate && (
            <span className="ml-auto text-[10px] text-text-tertiary dark:text-gray-400">
               {weddingDate}
            </span>
          )}
        </div>
      </div>

      {/* Bridesmaids list */}
      <div className="mt-2 space-y-1.5">
        <p className="text-[10px] font-bold text-text-primary dark:text-gray-100">
           الوصيفات ({bridesmaids.length})
        </p>
        {bridesmaids.map((b, i) => (
          <div
            key={b.name}
            className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-pink-200 to-rose-200 text-[10px] font-bold text-pink-700 dark:from-pink-800 dark:to-rose-800 dark:text-pink-200">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-text-primary dark:text-gray-100">{b.name}</p>
              {b.role && (
                <p className="text-[10px] text-text-tertiary dark:text-gray-500">{b.role}</p>
              )}
            </div>
            {b.lookAssigned ? (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                 تم التنسيق
              </span>
            ) : (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                 بانتظار التنسيق
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-text-secondary dark:text-gray-300">تقدم التنسيق</span>
          <span className="font-bold text-rose-600 dark:text-rose-400">
            {assigned}/{bridesmaids.length}
          </span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-rose-400 to-pink-500 transition-all"
            style={{
              width: `${bridesmaids.length > 0 ? Math.round((assigned / bridesmaids.length) * 100) : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Pricing */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-rose-50 p-2 text-center dark:bg-rose-950">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">الإجمالي</p>
          <p className="text-sm font-bold text-rose-700 dark:text-rose-300">{totalPrice} ر.س</p>
        </div>
        <div className="rounded-xl bg-rose-50 p-2 text-center dark:bg-rose-950">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">للفرد</p>
          <p className="text-sm font-bold text-rose-700 dark:text-rose-300">{pricePerPerson} ر.س</p>
        </div>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={onCoordinate}
        className="mt-3 w-full rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-700 active:scale-[0.98] transition-all"
      >
        نسّقي إطلالات الوصيفات 
      </button>

      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
         لأن صديقاتكِ جزء من يومكِ الخاص
      </p>
    </div>
  );
}
