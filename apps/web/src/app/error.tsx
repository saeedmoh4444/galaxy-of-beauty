'use client';

import { ErrorAlert } from '@galaxy/shared';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <ErrorAlert
        title="حدث خطأ غير متوقع"
        message={error.message || 'An unexpected error occurred'}
        onRetry={reset}
      />
    </div>
  );
}
