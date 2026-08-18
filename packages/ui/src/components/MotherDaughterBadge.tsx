'use client';

/**
 * Mother-Daughter Badge — for family-friendly services.
 * From Phase W7: Mother-Daughter & Family.
 */

export function MotherDaughterBadge({
  className = '',
  label = 'باقة الأم وابنتها',
  suffix = 'لحظات لا تُنسى',
}: {
  className?: string;
  label?: string;
  suffix?: string;
}): JSX.Element {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-rose-100 to-pink-100 px-3 py-1.5 text-xs font-bold text-rose-700 dark:from-rose-950 dark:to-pink-950 dark:text-rose-300 ${className}`}
    >
      <span>‍</span>
      <span>{label}</span>
      <span className="text-rose-400">•</span>
      <span>{suffix}</span>
    </span>
  );
}
