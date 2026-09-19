'use client';

import type { ReactNode } from 'react';

/**
 * 5.1 — booking wizard step transition. Re-mounts its children whenever
 * `stepKey` changes, replaying the `animate-step-in` keyframes (defined in
 * the web app's @theme block). Respects prefers-reduced-motion via CSS.
 */
export function StepTransition({
  stepKey,
  children,
  className = '',
}: {
  stepKey: number | string;
  children: ReactNode;
  className?: string;
}): ReactNode {
  return (
    <div key={stepKey} className={`animate-step-in ${className}`}>
      {children}
    </div>
  );
}
