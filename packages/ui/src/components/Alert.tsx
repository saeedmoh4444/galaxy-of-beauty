'use client';

import { useState, type ReactNode } from 'react';

/**
 * Alert banner — info/success/warning messages.
 * Different from ErrorAlert which is specifically for errors.
 */

interface AlertProps {
  children: ReactNode;
  variant?: 'info' | 'success' | 'warning';
  dismissible?: boolean;
  className?: string;
}

const VARIANTS = {
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-300',
    icon: 'ℹ️',
  },
  success: {
    bg: 'bg-green-50 dark:bg-green-950',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-700 dark:text-green-300',
    icon: '',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-950',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-700 dark:text-amber-300',
    icon: '',
  },
};

export function Alert({
  children,
  variant = 'info',
  dismissible = false,
  className = '',
}: AlertProps): JSX.Element | null {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const v = VARIANTS[variant];
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border p-4 ${v.bg} ${v.border} ${className}`}
      role="alert"
    >
      <span className="mt-0.5">{v.icon}</span>
      <div className={`flex-1 text-sm font-medium ${v.text}`}>{children}</div>
      {dismissible ? (
        <button
          onClick={() => setDismissed(true)}
          className="text-current opacity-50 hover:opacity-100"
        >
          
        </button>
      ) : null}
    </div>
  );
}
