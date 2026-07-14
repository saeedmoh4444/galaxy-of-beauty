import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Providers from '@/components/Providers';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SkipLink } from '@/components/SkipLink';
import './globals.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Galaxy of Beauty | جالكسي بيوتي',
  description: 'Secure marketplace for beauty & grooming services in Saudi Arabia',
};

export default function RootLayout({ children }: { children: ReactNode }): ReactNode {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="min-h-screen bg-white font-sans text-gray-900 antialiased dark:bg-gray-950 dark:text-gray-100">
        <SkipLink />
        <main id="main-content" tabIndex={-1}>
          <ErrorBoundary>
            <Providers>{children}</Providers>
          </ErrorBoundary>
        </main>
      </body>
    </html>
  );
}
