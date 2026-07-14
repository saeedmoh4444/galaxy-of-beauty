'use client';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const sizeMap = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-3',
  lg: 'h-12 w-12 border-4',
};

/**
 * Accessible loading spinner with optional label.
 * Uses border-based animation for GPU-accelerated rendering.
 */
export function Spinner({ size = 'md', className = '', label = 'جاري التحميل...' }: SpinnerProps): JSX.Element {
  return (
    <div role="status" aria-label={label} className={`inline-flex flex-col items-center gap-2 ${className}`}>
      <div
        className={`${sizeMap[size]} animate-spin rounded-full border-gray-200 border-t-brand-600 dark:border-gray-700 dark:border-t-brand-400`}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

/**
 * Full-page loading state with centered spinner.
 */
export function PageSpinner({ message = 'جاري التحميل...' }: { message?: string }): JSX.Element {
  return (
    <div
      role="status"
      aria-label={message}
      className="flex min-h-[60vh] flex-col items-center justify-center gap-4"
    >
      <Spinner size="lg" label={message} />
      <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  );
}
