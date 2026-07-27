'use client';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 dark:bg-gray-950">
      <img src="/logo.png" alt="جالكسي بيوتي" className="mb-8 h-20 w-20 rounded-2xl object-cover shadow-lg" />
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">حدث خطأ غير متوقع</h1>
      <p className="mt-2 max-w-md text-center text-sm text-gray-500 dark:text-gray-400">
        {error.message || 'يرجى المحاولة مرة أخرى. إذا استمرت المشكلة، تواصلي مع فريق الدعم.'}
      </p>
      <div className="mt-6 flex gap-3">
        <button onClick={reset} className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700">
          إعادة المحاولة
        </button>
        <a href="/" className="rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
          العودة للرئيسية
        </a>
      </div>
    </div>
  );
}
