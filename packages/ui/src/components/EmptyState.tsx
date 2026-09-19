'use client';

import type { ReactNode } from 'react';
import { Mascot } from './Mascot';
import type { MascotMood } from './Mascot';

interface EmptyStateProps {
  icon?: ReactNode;
  /** 5.1 — mascot mood (icon wins when both are set). */
  mood?: MascotMood;
  title: string;
  description?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  className?: string;
}

/**
 * Empty state component with optional call-to-action.
 * Used as the `<FeatureEmpty>` state in every data-fetching view.
 */
export function EmptyState({
  icon,
  mood = 'happy',
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-center ${className}`}>
      {icon ?? <Mascot mood={mood} className="mb-4" />}
      <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-text-secondary dark:text-text-tertiary">
          {description}
        </p>
      )}
      {action && (
        <button
          type="button"
          onClick={action.onPress}
          className="mt-6 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
