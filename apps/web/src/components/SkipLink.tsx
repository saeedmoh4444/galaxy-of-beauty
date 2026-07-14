'use client';

/**
 * Skip-to-content link for keyboard navigation.
 * Visible on focus, hidden otherwise. Placed as the first focusable element.
 */
export function SkipLink(): JSX.Element {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-3 focus:text-sm focus:font-medium focus:text-white focus:shadow-lg focus:outline-none"
      aria-label="تخطي إلى المحتوى الرئيسي"
    >
      تخطي إلى المحتوى الرئيسي
    </a>
  );
}
