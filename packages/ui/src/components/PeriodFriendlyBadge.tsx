'use client';

/**
 * Period Friendly Badge — signals the salon provides period care kits.
 * From Phase W9: Thoughtful Touches — women-centric micro-features.
 */

interface PeriodFriendlyBadgeProps {
  className?: string;
}

export function PeriodFriendlyBadge({ className = '' }: PeriodFriendlyBadgeProps): JSX.Element {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-pink-100 px-3 py-1.5 text-xs font-semibold text-pink-700 dark:bg-pink-950 dark:text-pink-300 ${className}`} title="أدوات الدورة الشهرية متوفرة مجاناً">
      <span className="text-base">🩸</span>
      <span>أدوات الدورة متوفرة</span>
      <span className="text-pink-400">•</span>
      <span>مجاناً</span>
    </span>
  );
}
