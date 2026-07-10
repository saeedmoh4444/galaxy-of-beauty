import Link from 'next/link';
import { EmptyState } from '@galaxy/shared';

export default function NotFound(): JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <EmptyState
        title="الصفحة غير موجودة"
        description="عذراً، الصفحة التي تبحث عنها غير موجودة"
        action={{ label: 'العودة للرئيسية', onPress: () => {} }}
      />
      <div className="mt-4 text-center">
        <Link href="/" className="text-brand-600 hover:underline">
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
