'use client';

import { cloneElement, useId, isValidElement, type ReactElement, type ReactNode } from 'react';

/**
 * Tooltip — hover/focus helper label (§3.6 secondary layer).
 *
 * Pure CSS (group-hover + group-focus-within): no JS, no timers, so
 * keyboard users get it via focus too. Colors auto-invert through
 * semantic tokens (text-primary bg / surface text) — dark mode gets a
 * light tooltip for free. Centering uses start-1/2 + -translate-x-1/2 —
 * direction-agnostic, identical in RTL.
 *
 * A11y: role="tooltip", aria-describedby wired onto the trigger.
 *
 * Usage:
 *   <Tooltip content="انسخ الكود">
 *     <button></button>
 *   </Tooltip>
 */

interface TooltipProps {
  content: string;
  children: ReactNode;
  /** Placement relative to the trigger */
  position?: 'top' | 'bottom';
  className?: string;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  className = '',
}: TooltipProps): JSX.Element {
  const id = useId();

  const trigger = isValidElement(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, {
        'aria-describedby': id,
      })
    : children;

  return (
    <span className={`group relative inline-flex ${className}`}>
      {trigger}
      <span
        id={id}
        role="tooltip"
        className={`pointer-events-none absolute start-1/2 z-50 w-max max-w-[240px] -translate-x-1/2 rounded-lg bg-text-primary px-3 py-1.5 text-center text-xs font-medium leading-relaxed text-surface opacity-0 shadow-lg transition-opacity duration-150 group-focus-within:opacity-100 group-hover:opacity-100 ${
          position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
        }`}
      >
        {content}
      </span>
    </span>
  );
}
