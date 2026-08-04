'use client';

import type { ReactNode } from 'react';
import { cn } from '@galaxy/shared';

interface PageContainerProps {
  children: ReactNode;
  /** narrow = 672px (forms), default = 896px, wide = 1152px, full = no max-width */
  width?: 'narrow' | 'default' | 'wide' | 'full';
  className?: string;
}

const widthStyles: Record<NonNullable<PageContainerProps['width']>, string> = {
  narrow: 'max-w-2xl',
  default: 'max-w-4xl',
  wide: 'max-w-6xl',
  full: '',
};

/**
 * Standardised page container with consistent max-width, padding, and vertical rhythm.
 * Replaces ad-hoc `mx-auto max-w-3xl space-y-6 px-4` patterns across 80+ pages.
 */
export function PageContainer({
  children,
  width = 'default',
  className = '',
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto space-y-6 px-4 py-8 sm:px-6 lg:px-8',
        widthStyles[width],
        className,
      )}
    >
      {children}
    </div>
  );
}
