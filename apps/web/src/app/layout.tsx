import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import TRPCProvider from '@/components/TRPCProvider';
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
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
