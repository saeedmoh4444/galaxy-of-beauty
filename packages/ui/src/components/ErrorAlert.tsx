'use client';

import { Button } from './Button';
import { Mascot } from './Mascot';
import type { MascotMood } from './Mascot';

interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
  /** 5.1 — mascot mood for the error illustration (default oops). */
  mood?: MascotMood;
}

/**
 * Error alert component with optional retry button.
 * Used as the `<FeatureError>` state in every data-fetching view.
 */
export function ErrorAlert({
  title = 'حدث خطأ ما',
  message,
  onRetry,
  className = '',
  mood = 'oops',
}: ErrorAlertProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`rounded-2xl border border-danger/30 bg-danger-subtle p-6 dark:border-red-800 dark:bg-red-950 ${className}`}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <Mascot mood={mood} size={56} />
        <div>
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">{title}</h3>
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{message}</p>
        </div>
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
