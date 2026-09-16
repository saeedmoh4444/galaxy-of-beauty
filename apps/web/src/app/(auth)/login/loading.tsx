import type { JSX } from 'react';
import { FormSkeleton } from '@galaxy/ui';

export default function LoginLoading(): JSX.Element {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-linear-to-br from-brand-50 to-brand-50 px-4 dark:from-gray-950 dark:to-gray-900"
      dir="rtl"
    >
      <div className="w-full max-w-md">
        <FormSkeleton fields={2} ariaLabel="جاري تحميل تسجيل الدخول" />
      </div>
    </div>
  );
}
