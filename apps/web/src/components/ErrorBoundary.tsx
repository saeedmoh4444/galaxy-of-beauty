'use client';

import { Component, useEffect, useState } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import type { Locale } from '@galaxy/shared';
import { t } from '@galaxy/shared';
import { LOCALE_CHANGE_EVENT } from '@/components/LocaleProvider';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary wraps the LocaleProvider, so its fallback cannot consume the
 * locale context. Read the locale from <html lang> instead — the server sets
 * it and setLocale keeps it in sync.
 */
function usePageLocale(): Locale {
  const [locale, setLocale] = useState<Locale>('ar');
  useEffect(() => {
    const read = () => setLocale(document.documentElement.lang === 'en' ? 'en' : 'ar');
    read();
    window.addEventListener(LOCALE_CHANGE_EVENT, read as EventListener);
    return () => window.removeEventListener(LOCALE_CHANGE_EVENT, read as EventListener);
  }, []);
  return locale;
}

function ErrorFallback({
  error,
  onReset,
}: {
  error: Error | null;
  onReset: () => void;
}): JSX.Element {
  const locale = usePageLocale();

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex min-h-[400px] flex-col items-center justify-center px-4 text-center"
    >
      <div className="rounded-full bg-red-100 p-4 dark:bg-red-900">
        <svg
          className="h-10 w-10 text-red-600 dark:text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
      </div>
      <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-gray-100">
        {t('error.unexpected', locale)}
      </h2>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md">
        {t('error.unexpected-desc', locale)}
      </p>
      {error && (
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500 font-mono max-w-lg truncate">
          {error.message}
        </p>
      )}
      <div className="mt-6 flex gap-3">
        <button
          onClick={onReset}
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          aria-label={t('error.try-again-aria', locale)}
        >
          {t('error.try-again', locale)}
        </button>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          aria-label={t('error.reload-page', locale)}
        >
          {t('error.reload-page', locale)}
        </button>
      </div>
    </div>
  );
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error.message, errorInfo.componentStack);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}
