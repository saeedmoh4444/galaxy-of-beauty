import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import type { Locale } from '@galaxy/shared';
import Providers from '@/components/Providers';
import { LocaleProvider } from '@/components/LocaleProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SkipLink } from '@/components/SkipLink';
import { OfflineBanner } from '@/components/OfflineBanner';
import { ToastProvider, DEFAULT_LOCAL_URL } from '@galaxy/ui';
import './globals.css';

export const dynamic = 'force-dynamic';

export const viewport: Viewport = {
  themeColor: '#c41e3a',
};

export const metadata: Metadata = {
  title: {
    default: 'Galaxy of Beauty | جالكسي بيوتي',
    template: '%s | Galaxy of Beauty',
  },
  description:
    'Secure marketplace for beauty & grooming services in Saudi Arabia — book vetted female technicians for hair, nails, skincare, makeup, massage & henna.',
  metadataBase: new URL(process.env['NEXT_PUBLIC_APP_URL'] || DEFAULT_LOCAL_URL),
  icons: { icon: '/logo.png', apple: '/logo.png' },
  manifest: '/manifest.json',
  openGraph: {
    title: 'Galaxy of Beauty | جالكسي بيوتي',
    description:
      'Secure marketplace for beauty & grooming services in Saudi Arabia — book vetted female technicians.',
    siteName: 'Galaxy of Beauty',
    locale: 'ar_SA',
    type: 'website',
    images: ['/logo.png'],
  },
  twitter: {
    card: 'summary',
    title: 'Galaxy of Beauty | جالكسي بيوتي',
    description: 'Beauty & grooming marketplace — Saudi Arabia',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}): Promise<ReactNode> {
  // Read locale from cookie (default: Arabic) — cookies() is async in Next.js 15
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('gob_lang')?.value === 'en' ? 'en' : 'ar';
  const isRTL = locale === 'ar';

  // Pre-paint theme application: read localStorage before first paint so
  // dark-mode users never see a light flash. Touches only documentElement
  // (server HTML never renders the class; suppressHydrationWarning is set).
  const themeInitScript = `(function(){try{var s=localStorage.getItem('theme');var d=s==='dark'||(!s&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

  return (
    <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen bg-white font-sans text-text-primary antialiased dark:bg-gray-950 dark:text-gray-100">
        <SkipLink />
        <OfflineBanner />
        <main id="main-content" tabIndex={-1}>
          <ErrorBoundary>
            <ToastProvider>
              <LocaleProvider initialLocale={locale}>
                <Providers>{children}</Providers>
              </LocaleProvider>
            </ToastProvider>
          </ErrorBoundary>
        </main>
      </body>
    </html>
  );
}
