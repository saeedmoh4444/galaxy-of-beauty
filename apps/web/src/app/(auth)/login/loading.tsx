import type { JSX } from 'react';
export default function LoginLoading(): JSX.Element {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 to-brand-50 px-4 dark:from-gray-950 dark:to-gray-900"
      dir="rtl"
    >
      <div className="w-full max-w-md rounded-2xl border border-edge bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <div className="mx-auto h-10 w-48 animate-pulse rounded-lg bg-surface-muted" />
            <div className="mx-auto h-4 w-32 animate-pulse rounded bg-surface-muted" />
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-surface-muted" />
              <div className="h-10 w-full animate-pulse rounded-lg bg-surface-muted" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-surface-muted" />
              <div className="h-10 w-full animate-pulse rounded-lg bg-surface-muted" />
            </div>
            <div className="h-11 w-full animate-pulse rounded-lg bg-surface-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
