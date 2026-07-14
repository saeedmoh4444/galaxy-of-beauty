import type { ChildrenProps } from '../types/index';

/**
 * Generic loading skeleton component.
 * Renders a shimmer placeholder block.
 */
export function Skeleton({ children }: ChildrenProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"
    >
      {children ?? <div className="h-24 w-full" />}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 p-6 dark:border-gray-700">
      <div className="animate-pulse space-y-4">
        <div className="h-48 w-full rounded-xl bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700 h-16 w-full"
        />
      ))}
    </div>
  );
}

/** Text line skeleton for paragraph placeholders */
export function TextLineSkeleton({ width = 'full', className = '' }: { width?: string; className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading text"
      className={`animate-pulse rounded bg-gray-200 dark:bg-gray-700 h-3 ${width === 'full' ? 'w-full' : width} ${className}`}
    />
  );
}

/** Avatar circle skeleton */
export function AvatarSkeleton({ size = 10 }: { size?: number }) {
  const px = size * 4;
  return (
    <div
      role="status"
      aria-label="Loading avatar"
      className={`animate-pulse rounded-full bg-gray-200 dark:bg-gray-700`}
      style={{ width: px, height: px }}
    />
  );
}

/** Table row skeleton with multiple columns */
export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <div className="flex gap-4 py-3" role="status" aria-label="Loading table row">
      {Array.from({ length: cols }, (_, i) => (
        <div
          key={i}
          className="animate-pulse rounded bg-gray-200 dark:bg-gray-700 h-4 flex-1"
        />
      ))}
    </div>
  );
}
