import { formatCurrency } from '@galaxy/shared';

/**
 * Price Tag — consistent price display with optional discount.
 *
 * Usage:
 *   <PriceTag price={200} />
 *   <PriceTag price={160} originalPrice={200} />
 */

interface PriceTagProps {
  price: number;
  originalPrice?: number;
  currency?: string;
  className?: string;
}

export function PriceTag({ price, originalPrice, currency = 'ر.س', className = '' }: PriceTagProps): JSX.Element {
  const hasDiscount = originalPrice && originalPrice > price;
  const savings = hasDiscount ? Math.round(((originalPrice! - price) / originalPrice!) * 100) : 0;

  return (
    <span className={`inline-flex items-baseline gap-2 ${className}`}>
      <span className="text-lg font-extrabold text-brand-600 dark:text-brand-400">
        {formatCurrency(price)}
      </span>
      <span className="text-xs text-text-secondary dark:text-gray-400">{currency}</span>
      {hasDiscount ? (
        <>
          <span className="text-sm text-text-tertiary line-through">{formatCurrency(originalPrice!)}</span>
          <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-bold text-green-700 dark:bg-green-950 dark:text-green-300">
            -{savings}%
          </span>
        </>
      ) : null}
    </span>
  );
}
