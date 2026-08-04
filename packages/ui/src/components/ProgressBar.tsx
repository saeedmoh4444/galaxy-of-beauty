'use client';

interface ProgressBarProps {
  /** 0-100 progress value; omit for indeterminate mode */
  value?: number;
  /** Show at top of page as a sticky bar */
  sticky?: boolean;
  /** ARIA label for screen readers */
  label?: string;
  className?: string;
}

/**
 * Accessible progress bar.
 * - Determinate mode: pass `value` (0–100).
 * - Indeterminate mode: omit `value` for an animated loading bar.
 */
export function ProgressBar({
  value,
  sticky = false,
  label = 'جاري التحميل',
  className = '',
}: ProgressBarProps): JSX.Element {
  const isIndeterminate = value === undefined;

  const bar = (
    <div
      role="progressbar"
      aria-valuenow={isIndeterminate ? undefined : value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={`h-1 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 ${className}`}
    >
      <div
        className={`h-full rounded-full bg-brand-600 transition-all duration-300 dark:bg-brand-400 ${
          isIndeterminate ? 'w-1/3 animate-indeterminate' : ''
        }`}
        style={isIndeterminate ? undefined : { width: `${Math.min(100, Math.max(0, value!))}%` }}
      />
    </div>
  );

  if (sticky) {
    return <div className="fixed top-0 left-0 right-0 z-50">{bar}</div>;
  }

  return bar;
}
