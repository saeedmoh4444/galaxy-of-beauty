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
