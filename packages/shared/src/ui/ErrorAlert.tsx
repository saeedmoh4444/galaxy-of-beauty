'use client';

import type { ReactNode } from 'react';

interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Error alert component with optional retry button.
 * Used as the `<FeatureError>` state in every data-fetching view.
 */
export function ErrorAlert({
  title = 'Something went wrong',
  message,
  onRetry,
  className = '',
}: ErrorAlertProps) {
  return (
    <div
      role="alert"
      className={`rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950 ${className}`}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="rounded-full bg-red-100 p-3 dark:bg-red-900">
          <svg
            className="h-6 w-6 text-red-600 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>
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

// Inline import to avoid circular dependency — simple button inline
function Button({
  variant = 'primary',
  onClick,
  children,
}: {
  variant?: 'primary' | 'outline';
  onClick?: () => void;
  children: ReactNode;
}) {
  const base = 'rounded-lg px-4 py-2 text-sm font-medium transition-colors';
  const variants = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
  };
  return (
    <button className={`${base} ${variants[variant]}`} onClick={onClick}>
      {children}
    </button>
  );
}
