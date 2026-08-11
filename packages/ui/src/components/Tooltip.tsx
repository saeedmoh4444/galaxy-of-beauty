'use client';

import type { ReactNode } from 'react';

/**
 * Simple Tooltip — shows on hover.
 *
 * Usage:
 *   <Tooltip content="انسخ الكود">
 *     <button>📋</button>
 *   </Tooltip>
 */

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom';
}

export function Tooltip({ content, children, position = 'top' }: TooltipProps): JSX.Element {
  const posClass = position === 'top' ? '-top-8' : '-bottom-8';

  return (
    <span className="group relative inline-flex">
      {children}
      <span
        className={`pointer-events-none absolute left-1/2 -translate-x-1/2 ${posClass} z-50 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-gray-100 dark:text-gray-900`}
      >
        {content}
      </span>
    </span>
  );
}
