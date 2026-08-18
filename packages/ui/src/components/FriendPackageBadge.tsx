'use client';

/**
 * Friend Package Badge — "Bring a friend" group booking indicator.
 * From Phase W7: Friends Who Slay Together.
 */

export function FriendPackageBadge({
  discount = 15,
  label = 'باقة الصديقات',
  discountLabel = 'خصم',
  percentSuffix = '٪',
  className = '',
}: {
  discount?: number;
  label?: string;
  discountLabel?: string;
  percentSuffix?: string;
  className?: string;
}): JSX.Element {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 px-3 py-1.5 text-xs font-bold text-amber-700 dark:from-amber-950 dark:to-orange-950 dark:text-amber-300 ${className}`}
    >
      <span>‍️</span>
      <span>{label}</span>
      <span className="text-amber-400">•</span>
      <span>
        {discountLabel} {discount}
        {percentSuffix}
      </span>
    </span>
  );
}
