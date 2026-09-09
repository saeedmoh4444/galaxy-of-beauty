'use client';

/**
 * Mentor Badge — for technicians who mentor other women.
 * From Phase W4: Sisterhood & Community — Mentor-Mentee Program.
 */

export function MentorBadge({
  className = '',
  label = 'مرشدة',
}: {
  className?: string;
  label?: string;
}): JSX.Element {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-100 to-pink-100 px-3 py-1.5 text-xs font-bold text-brand-700 dark:from-brand-950 dark:to-pink-950 dark:text-brand-300 ${className}`}
    >
      <span className="text-base">‍</span>
      <span>{label}</span>
      <span className="hidden sm:inline text-brand-400">•</span>
      <span className="hidden sm:inline">Big Sister</span>
    </span>
  );
}
