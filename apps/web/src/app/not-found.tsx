import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: '404 - الصفحة غير موجودة' };

export default function NotFound(): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 text-8xl">🔍</div>
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">٤٠٤</h1>
      <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">عذراً، الصفحة التي تبحث عنها غير موجودة</p>
      <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">ربما تم نقلها أو حذفها</p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700">
          العودة للرئيسية
        </Link>
        <Link href="/services" className="rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
          تصفح الخدمات
        </Link>
      </div>
    </div>
  );
}
