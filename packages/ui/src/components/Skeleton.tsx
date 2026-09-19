import type { ChildrenProps } from '@galaxy/shared';

/** 5.1 — branded gradient shimmer (Rose Blush sweep) shared by all
 * skeleton variants; keyframes live in the web app's @theme block. */
const SHIMMER =
  'animate-shimmer bg-linear-to-r from-brand-600/10 via-brand-600/25 to-brand-600/10 bg-[length:200%_100%]';

/**
 * Generic loading skeleton component.
 * Renders a branded shimmer placeholder block.
 */
export function Skeleton({ children }: ChildrenProps) {
  return (
    <div role="status" aria-label="Loading" className={`rounded-lg ${SHIMMER}`}>
      {children ?? <div className="h-24 w-full" />}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-edge p-6">
      <div className="space-y-4">
        <div className={`h-48 w-full rounded-xl ${SHIMMER}`} />
        <div className={`h-4 w-3/4 rounded ${SHIMMER}`} />
        <div className={`h-4 w-1/2 rounded ${SHIMMER}`} />
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={`h-16 w-full rounded-lg ${SHIMMER}`} />
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
      className={`h-3 rounded ${SHIMMER} ${width === 'full' ? 'w-full' : width} ${className}`}
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
      className={`rounded-full ${SHIMMER}`}
      style={{ width: px, height: px }}
    />
  );
}

/** Table row skeleton with multiple columns */
export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <div className="flex gap-4 py-3" role="status" aria-label="Loading table row">
      {Array.from({ length: cols }, (_, i) => (
        <div key={i} className={`h-4 flex-1 rounded ${SHIMMER}`} />
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Sized skeleton templates — match live content dimensions
// to prevent Cumulative Layout Shift (CLS).
// ──────────────────────────────────────────────────────────────

/** Skeleton that matches a dashboard with stat cards, quick actions, and content sections. */
export function DashboardSkeleton({
  ariaLabel = 'جاري تحميل لوحة التحكم',
}: {
  ariaLabel?: string;
}) {
  return (
    <div role="status" aria-label={ariaLabel} className="space-y-6">
      {/* Stat cards row */}
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="rounded-2xl border border-edge bg-surface p-6">
            <div className="space-y-3">
              <div className={`mx-auto h-8 w-8 rounded-full ${SHIMMER}`} />
              <div className={`mx-auto h-6 w-16 rounded ${SHIMMER}`} />
              <div className={`mx-auto h-3 w-20 rounded ${SHIMMER}`} />
            </div>
          </div>
        ))}
      </div>
      {/* Quick actions bar */}
      <div className="flex gap-2">
        <div className={`h-9 w-28 rounded-lg ${SHIMMER}`} />
        <div className={`h-9 w-32 rounded-lg ${SHIMMER}`} />
        <div className={`h-9 w-24 rounded-lg ${SHIMMER}`} />
      </div>
      {/* Two-column content */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-edge bg-surface p-6">
          <div className="space-y-3">
            <div className={`h-5 w-32 rounded ${SHIMMER}`} />
            <div className={`h-16 w-full rounded-lg ${SHIMMER}`} />
            <div className={`h-16 w-full rounded-lg ${SHIMMER}`} />
            <div className={`h-16 w-full rounded-lg ${SHIMMER}`} />
          </div>
        </div>
        <div className="rounded-2xl border border-edge bg-surface p-6">
          <div className="space-y-3">
            <div className={`h-5 w-32 rounded ${SHIMMER}`} />
            <div className={`h-16 w-full rounded-lg ${SHIMMER}`} />
            <div className={`h-16 w-full rounded-lg ${SHIMMER}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Skeleton that matches a list of cards with consistent heights (e.g., bookings, services). */
export function CardListSkeleton({
  count = 4,
  ariaLabel = 'جاري تحميل القائمة',
}: {
  count?: number;
  ariaLabel?: string;
}) {
  return (
    <div role="status" aria-label={ariaLabel} className="space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="rounded-2xl border border-edge bg-surface p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className={`h-4 w-32 rounded ${SHIMMER}`} />
              <div className={`h-3 w-24 rounded ${SHIMMER}`} />
            </div>
            <div className={`h-6 w-20 rounded-full ${SHIMMER}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Skeleton that matches a detail page with header, main content, and sidebar. */
export function DetailSkeleton({ ariaLabel = 'جاري تحميل التفاصيل' }: { ariaLabel?: string }) {
  return (
    <div role="status" aria-label={ariaLabel} className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className={`h-8 w-48 rounded ${SHIMMER}`} />
        <div className={`h-4 w-96 rounded ${SHIMMER}`} />
      </div>
      {/* Main + sidebar */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-edge bg-surface p-6">
          <div className="space-y-4">
            <div className={`h-48 w-full rounded-xl ${SHIMMER}`} />
            <div className={`h-4 w-3/4 rounded ${SHIMMER}`} />
            <div className={`h-4 w-1/2 rounded ${SHIMMER}`} />
            <div className={`h-4 w-5/6 rounded ${SHIMMER}`} />
          </div>
        </div>
        <div className="rounded-2xl border border-edge bg-surface p-6">
          <div className="space-y-4">
            <div className={`h-5 w-24 rounded ${SHIMMER}`} />
            <div className={`h-10 w-full rounded-lg ${SHIMMER}`} />
            <div className={`h-10 w-full rounded-lg ${SHIMMER}`} />
            <div className={`h-10 w-full rounded-lg ${SHIMMER}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Skeleton that matches a form inside a card. */
export function FormSkeleton({
  fields = 5,
  ariaLabel = 'جاري تحميل النموذج',
}: {
  fields?: number;
  ariaLabel?: string;
}) {
  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className="rounded-2xl border border-edge bg-surface p-6"
    >
      <div className="space-y-5">
        <div className={`h-6 w-36 rounded ${SHIMMER}`} />
        {Array.from({ length: fields }, (_, i) => (
          <div key={i} className="space-y-2">
            <div className={`h-3 w-20 rounded ${SHIMMER}`} />
            <div className={`h-10 w-full rounded-lg ${SHIMMER}`} />
          </div>
        ))}
        <div className={`h-10 w-24 rounded-lg ${SHIMMER}`} />
      </div>
    </div>
  );
}

/** Skeleton that matches a horizontal KPI/metric row. */
export function KPIRowSkeleton({
  count = 4,
  ariaLabel = 'جاري تحميل المؤشرات',
}: {
  count?: number;
  ariaLabel?: string;
}) {
  return (
    <div role="status" aria-label={ariaLabel} className="flex gap-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex-1 rounded-2xl border border-edge bg-surface p-5">
          <div className="space-y-3 text-center">
            <div className={`mx-auto h-10 w-10 rounded-full ${SHIMMER}`} />
            <div className={`mx-auto h-8 w-16 rounded ${SHIMMER}`} />
            <div className={`mx-auto h-3 w-24 rounded ${SHIMMER}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Skeleton that matches a responsive product/service grid. */
export function GridSkeleton({
  count = 8,
  ariaLabel = 'جاري تحميل العناصر',
}: {
  count?: number;
  ariaLabel?: string;
}) {
  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="rounded-2xl border border-edge bg-surface-elevated p-4">
          <div className="space-y-3">
            <div className={`aspect-square w-full rounded-xl ${SHIMMER}`} />
            <div className={`h-4 w-3/4 rounded ${SHIMMER}`} />
            <div className={`h-3 w-1/2 rounded ${SHIMMER}`} />
            <div className={`h-6 w-1/3 rounded ${SHIMMER}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Inline text skeleton — matches a single line of text. */
export function TextSkeleton({ width = '100%' }: { width?: string }) {
  return (
    <span className={`inline-block rounded ${SHIMMER} h-4`} style={{ width, minWidth: '3rem' }} />
  );
}

/** Skeleton that matches a full table with header and rows. */
export function TableSkeleton({
  rows = 5,
  cols = 4,
  ariaLabel = 'جاري تحميل الجدول',
}: {
  rows?: number;
  cols?: number;
  ariaLabel?: string;
}) {
  return (
    <div role="status" aria-label={ariaLabel} className="rounded-2xl border border-edge bg-surface">
      {/* Header */}
      <div className="border-b border-edge px-6 py-3">
        <div className="flex gap-4">
          {Array.from({ length: cols }, (_, i) => (
            <div key={i} className={`h-4 flex-1 rounded ${SHIMMER}`} />
          ))}
        </div>
      </div>
      {/* Rows */}
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="border-b border-edge-muted px-6 py-3 last:border-0">
          <div className="flex gap-4">
            {Array.from({ length: cols }, (_, j) => (
              <div key={j} className={`h-4 flex-1 rounded ${SHIMMER}`} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
