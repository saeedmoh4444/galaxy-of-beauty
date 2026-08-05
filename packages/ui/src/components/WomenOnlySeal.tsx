'use client';

/**
 * Women-Only Trust Seal — visible on every page.
 * Reinforces the platform's commitment to female-only services.
 */

export function WomenOnlySeal({ className = '' }: { className?: string }): JSX.Element {
  return (
    <div className={`inline-flex items-center gap-2 rounded-full bg-pink-50 px-3 py-1.5 text-xs font-semibold text-pink-700 dark:bg-pink-950 dark:text-pink-300 ${className}`}>
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
      </svg>
      <span>منصة نسائية بالكامل</span>
      <span className="hidden sm:inline text-pink-400">•</span>
      <span className="hidden sm:inline">فنيات سعوديات محترفات</span>
    </div>
  );
}
