'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Price Drop History Card — track price drops on favorite services.
 * From Phase W5: Financial Empowerment — Price Alert.
 *
 * Usage:
 *   <BeautyPriceDropHistoryCard drops={[{ service: 'مانيكير سبا', oldPrice: 150, newPrice: 99 }]} />
 */

interface PriceDrop {
  service: string;
  emoji?: string;
  oldPrice: number;
  newPrice: number;
  date?: string;
}

interface BeautyPriceDropHistoryCardProps {
  drops: PriceDrop[];
  title?: string;
  savingsPrefix?: string;
  currency?: string;
  className?: string;
}

export function BeautyPriceDropHistoryCard({
  drops,
  title = 'انخفاضات الأسعار',
  savingsPrefix = 'وفرتِ',
  currency = 'ر.س',
  className = '',
}: BeautyPriceDropHistoryCardProps): JSX.Element | null {
  if (!drops.length) return null;
  const totalSaved = drops.reduce((s, d) => s + (d.oldPrice - d.newPrice), 0);

  return (
    <div
      className={cn(
        'rounded-2xl border border-emerald-100 bg-white p-4 dark:border-emerald-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true"></span>
          <div>
            <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{title}</h4>
            <p className="text-[10px] text-emerald-500 dark:text-emerald-400">
              {savingsPrefix} {totalSaved} {currency}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        {drops.slice(0, 5).map((d, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 dark:bg-emerald-950"
          >
            <span className="text-sm">{d.emoji || ''}</span>
            <span className="flex-1 text-[10px] text-text-primary dark:text-gray-100 truncate">
              {d.service}
            </span>
            <span className="text-[10px] text-text-tertiary line-through dark:text-gray-500">
              {d.oldPrice}
            </span>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
              {d.newPrice} {currency}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
