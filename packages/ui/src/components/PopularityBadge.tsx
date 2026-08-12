'use client';

/**
 * Social proof badge — shows how many people booked/viewed a service.
 *
 * Usage:
 *   <PopularityBadge count={52} label="حجز هذا الأسبوع" />
 *   → "🔥 52+ حجز هذا الأسبوع"
 */

interface PopularityBadgeProps {
  count: number;
  label?: string;
  variant?: 'fire' | 'star' | 'trending';
  className?: string;
}

const ICONS = {
  fire: '🔥',
  star: '⭐',
  trending: '📈',
};

export function PopularityBadge({
  count,
  label = 'حجز هذا الأسبوع',
  variant = 'fire',
  className = '',
}: PopularityBadgeProps): JSX.Element | null {
  if (count < 5) return null;

  const displayCount =
    count >= 100 ? '100+' : count >= 50 ? '50+' : count >= 20 ? '20+' : `${count}+`;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300 ${className}`}
    >
      {ICONS[variant]} {displayCount} {label}
    </span>
  );
}
