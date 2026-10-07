'use client';

import { forwardRef, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '@galaxy/shared';
import { Icon } from './Icon';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  /** aria-label for the show/hide toggle when type="password" */
  showPasswordLabel?: string;
  /** aria-label for the toggle once the password is visible */
  hidePasswordLabel?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, hint, className, id, type, showPasswordLabel, hidePasswordLabel, ...props },
    ref,
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    const isPassword = type === 'password';
    const [visible, setVisible] = useState(false);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={isPassword && visible ? 'text' : type}
            className={cn(
              'w-full rounded-lg border border-edge bg-surface px-3 py-2 text-sm text-text-primary placeholder-text-tertiary transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
              'disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-tertiary',
              'bg-surface-elevated dark:placeholder-text-tertiary',
              isPassword && 'pr-10',
              error
                ? 'border-danger focus:ring-red-500 dark:border-red-700'
                : 'focus:border-transparent',
              className,
            )}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              aria-label={
                visible
                  ? (hidePasswordLabel ?? 'Hide password')
                  : (showPasswordLabel ?? 'Show password')
              }
              aria-pressed={visible}
              className="absolute inset-y-0 end-0 flex items-center px-3 text-text-tertiary transition-colors hover:text-text-secondary"
            >
              <Icon name={visible ? 'eye-off' : 'eye'} size="sm" />
            </button>
          )}
        </div>
        {hint && !error && (
          <p
            id={`${inputId}-hint`}
            className="mt-1 text-xs text-text-secondary dark:text-text-tertiary"
          >
            {hint}
          </p>
        )}
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-xs text-danger dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
