import type { JSX } from 'react';
/**
 * Divider — horizontal separator with optional label.
 *
 * Usage:
 *   <Divider />
 *   <Divider label="أو" />
 */

interface DividerProps {
  label?: string;
  className?: string;
}

export function Divider({ label, className = '' }: DividerProps): JSX.Element {
  if (!label) return <hr className={`border-edge ${className}`} />;
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <hr className="flex-1 border-edge" />
      <span className="text-sm text-text-tertiary dark:text-text-secondary">{label}</span>
      <hr className="flex-1 border-edge" />
    </div>
  );
}
