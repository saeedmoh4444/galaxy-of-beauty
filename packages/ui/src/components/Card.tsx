'use client';

import type { ReactNode } from 'react';
import { cn } from '@galaxy/shared';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const paddingStyles: Record<NonNullable<CardProps['padding']>, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({ children, className, padding = 'md', hover = false }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-edge bg-surface shadow-sm dark:border-gray-700 dark:bg-gray-900',
        paddingStyles[padding],
        hover &&
          'transition-shadow hover:shadow-md hover:border-brand-300 dark:hover:border-brand-700',
        className,
      )}
    >
      {children}
    </div>
  );
}
