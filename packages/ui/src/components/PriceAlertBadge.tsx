'use client';

import { useState } from 'react';
import { cn } from '@galaxy/shared';

/**
 * Price Alert Badge — get notified when a favorite service drops in price.
 * From Phase W5: Financial Empowerment — Price Alert.
 *
 * Usage:
 *   <PriceAlertBadge serviceName="مانيكير سبا" currentPrice={120} targetPrice={80} />
 */

interface PriceAlertBadgeProps {
  serviceName: string;
  currentPrice: number;
  /** Price below which you want to be alerted */
  targetPrice: number;
  /** Original price if currently discounted */
  originalPrice?: number;
  isActive?: boolean;
  onSetAlert?: (targetPrice: number) => void;
  onRemove?: () => void;
  className?: string;
}

export function PriceAlertBadge({
  serviceName,
  currentPrice,
  targetPrice,
  originalPrice,
  isActive: initialActive = false,
  onSetAlert,
  onRemove,
  className = '',
}: PriceAlertBadgeProps): JSX.Element {
  const [isActive, setIsActive] = useState(initialActive);
  const [target, setTarget] = useState(targetPrice);

  const isBelow = currentPrice <= target;
  const discount = originalPrice ? Math.round((1 - currentPrice / originalPrice) * 100) : 0;

  const handleToggle = () => {
    if (isActive) {
      setIsActive(false);
      onRemove?.();
    } else {
      setIsActive(true);
      onSetAlert?.(target);
    }
  };

  return (
    <div
      className={cn(
        'rounded-2xl border p-4 transition-all',
        isActive
          ? 'border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/30'
          : 'border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">🔔</span>
          <div>
            <h4 className="text-sm font-bold text-text-primary dark:text-gray-100">
              {serviceName}
            </h4>
            <p className="text-[10px] text-text-tertiary dark:text-gray-400">
              تنبيه السعر
            </p>
          </div>
        </div>

        {/* Toggle */}
        <button
          type="button"
          onClick={handleToggle}
          className={cn(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
            isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600',
          )}
        >
          <span
            className={cn(
              'inline-block h-4 w-4 rounded-full bg-white transition-transform',
              isActive ? 'translate-x-6' : 'translate-x-1',
            )}
          />
        </button>
      </div>

      {/* Price info */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-gray-50 p-2 text-center dark:bg-gray-800">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">السعر الحالي</p>
          <p className="text-xs font-bold text-text-primary dark:text-gray-100">
            {currentPrice} ر.س
          </p>
        </div>
        <div className="rounded-xl bg-gray-50 p-2 text-center dark:bg-gray-800">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">السعر المستهدف</p>
          <p className="text-xs font-bold text-green-700 dark:text-green-400">
            {target} ر.س
          </p>
        </div>
        <div className="rounded-xl bg-gray-50 p-2 text-center dark:bg-gray-800">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">الفرق</p>
          <p className={cn(
            'text-xs font-bold',
            isBelow ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
          )}>
            {isBelow ? '✅' : '📉'} {Math.abs(currentPrice - target)} ر.س
          </p>
        </div>
      </div>

      {/* Discount indicator */}
      {originalPrice && discount > 0 && (
        <div className="mt-2 rounded-lg bg-rose-50 px-2.5 py-1.5 text-center dark:bg-rose-950">
          <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300">
            🎉 مخفض {discount}% — من {originalPrice} إلى {currentPrice} ر.س
          </span>
        </div>
      )}

      {/* Target reached */}
      {isActive && isBelow && (
        <div className="mt-2 rounded-xl bg-emerald-100 p-3 text-center dark:bg-emerald-900">
          <p className="text-sm" aria-hidden="true">🎉</p>
          <p className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
            وصل السعر لهدفكِ!
          </p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
            السعر الآن {currentPrice} ر.س — احجزي قبل ما يرتفع
          </p>
        </div>
      )}

      {/* Adjust target */}
      {isActive && (
        <div className="mt-2 flex items-center gap-1.5">
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
            min={1}
            max={currentPrice}
            className="flex-1 rounded-lg border border-gray-200 px-2 py-1 text-[10px] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
          <span className="text-[10px] text-text-tertiary dark:text-gray-500">ر.س</span>
        </div>
      )}

      {/* Status message */}
      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        {isActive
          ? `سننبهكِ عندما يقل السعر عن ${target} ر.س`
          : 'فعّلي التنبيه ليصلكِ إشعار عند انخفاض السعر'}
      </p>
    </div>
  );
}
