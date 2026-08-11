import type { ChildrenProps } from '@galaxy/shared';

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
export function TextLineSkeleton({
  width = 'full',
  className = '',
}: {
  width?: string;
  className?: string;
}) {
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
        <div key={i} className="animate-pulse rounded bg-gray-200 dark:bg-gray-700 h-4 flex-1" />
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Sized skeleton templates — match live content dimensions
// to prevent Cumulative Layout Shift (CLS).
// ──────────────────────────────────────────────────────────────

/** Skeleton that matches a dashboard with stat cards, quick actions, and content sections. */
export function DashboardSkeleton() {
  return (
    <div role="status" aria-label="جاري تحميل لوحة التحكم" className="space-y-6">
      {/* Stat cards row */}
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="rounded-2xl border border-edge bg-surface p-6">
            <div className="animate-pulse space-y-3">
              <div className="mx-auto h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="mx-auto h-6 w-16 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="mx-auto h-3 w-20 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        ))}
      </div>
      {/* Quick actions bar */}
      <div className="animate-pulse flex gap-2">
        <div className="h-9 w-28 rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="h-9 w-32 rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="h-9 w-24 rounded-lg bg-gray-200 dark:bg-gray-700" />
      </div>
      {/* Two-column content */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-edge bg-surface p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-5 w-32 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-16 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
            <div className="h-16 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
            <div className="h-16 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
        <div className="rounded-2xl border border-edge bg-surface p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-5 w-32 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-16 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
            <div className="h-16 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Skeleton that matches a list of cards with consistent heights (e.g., bookings, services). */
export function CardListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div role="status" aria-label="جاري تحميل القائمة" className="space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="rounded-2xl border border-edge bg-surface p-4 sm:p-6">
          <div className="animate-pulse flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="h-6 w-20 rounded-full bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Skeleton that matches a detail page with header, main content, and sidebar. */
export function DetailSkeleton() {
  return (
    <div role="status" aria-label="جاري تحميل التفاصيل" className="space-y-6">
      {/* Header */}
      <div className="animate-pulse space-y-2">
        <div className="h-8 w-48 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-96 rounded bg-gray-200 dark:bg-gray-700" />
      </div>
      {/* Main + sidebar */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-edge bg-surface p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-48 w-full rounded-xl bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
        <div className="rounded-2xl border border-edge bg-surface p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-5 w-24 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-10 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
            <div className="h-10 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
            <div className="h-10 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Skeleton that matches a form inside a card. */
export function FormSkeleton({ fields = 5 }: { fields?: number }) {
  return (
    <div
      role="status"
      aria-label="جاري تحميل النموذج"
      className="rounded-2xl border border-edge bg-surface p-6"
    >
      <div className="animate-pulse space-y-5">
        <div className="h-6 w-36 rounded bg-gray-200 dark:bg-gray-700" />
        {Array.from({ length: fields }, (_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-10 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
        <div className="h-10 w-24 rounded-lg bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
}

/** Skeleton that matches a horizontal KPI/metric row. */
export function KPIRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div role="status" aria-label="جاري تحميل المؤشرات" className="flex gap-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex-1 rounded-2xl border border-edge bg-surface p-5">
          <div className="animate-pulse space-y-3 text-center">
            <div className="mx-auto h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="mx-auto h-8 w-16 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mx-auto h-3 w-24 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Skeleton that matches a responsive product/service grid. */
export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="جاري تحميل العناصر"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-edge bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
        >
          <div className="animate-pulse space-y-3">
            <div className="aspect-square w-full rounded-xl bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-6 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Inline text skeleton — matches a single line of text. */
export function TextSkeleton({ width = '100%' }: { width?: string }) {
  return (
    <span
      className="inline-block animate-pulse rounded bg-gray-200 dark:bg-gray-700 h-4"
      style={{ width, minWidth: '3rem' }}
    />
  );
}

/** Skeleton that matches a full table with header and rows. */
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div
      role="status"
      aria-label="جاري تحميل الجدول"
      className="rounded-2xl border border-edge bg-surface"
    >
      {/* Header */}
      <div className="border-b border-edge px-6 py-3">
        <div className="animate-pulse flex gap-4">
          {Array.from({ length: cols }, (_, i) => (
            <div key={i} className="h-4 flex-1 rounded bg-gray-200 dark:bg-gray-700" />
          ))}
        </div>
      </div>
      {/* Rows */}
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="border-b border-edge-muted px-6 py-3 last:border-0">
          <div className="animate-pulse flex gap-4">
            {Array.from({ length: cols }, (_, j) => (
              <div key={j} className="h-4 flex-1 rounded bg-gray-200 dark:bg-gray-700" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
