import Link from 'next/link';
import { EmptyState } from '@galaxy/shared';

export default function NotFound(): JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <EmptyState
        title="الصفحة غير موجودة"
        description="عذراً، الصفحة التي تبحث عنها غير موجودة"
      />
      <div className="mt-4 text-center">
        <Link href="/" className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white">
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
