'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import type { TranslationKey } from '@galaxy/shared';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';
import { BackToTop } from '@/components/BackToTop';
import { NotificationBadge } from '@/components/NotificationBadge';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { useLocale } from '@/components/LocaleProvider';

const navLinks: { href: string; key: TranslationKey }[] = [
  { href: '/discover', key: 'nav.discover' },
  { href: '/search', key: 'nav.search' },
  { href: '/marketplace', key: 'nav.marketplace' },
  { href: '/mommy-and-me', key: 'nav.mommyAndMe' },
  { href: '/lookbook', key: 'nav.lookbook' },
  { href: '/bundles', key: 'nav.bundles' },
  { href: '/beauty-quiz', key: 'nav.beautyQuiz' },
  { href: '/beauty-packages', key: 'nav.beautyPackages' },
  { href: '/bridal-concierge', key: 'nav.bridalConcierge' },
  { href: '/campaigns', key: 'nav.campaigns' },
  { href: '/events', key: 'nav.events' },
  { href: '/blog', key: 'nav.blog' },
];

export function MainLayout({ children }: { children: ReactNode }): JSX.Element {
  const pathname = usePathname();
  const { t } = useLocale();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt={t('common.brandName')}
              width={40}
              height={40}
              className="h-10 w-10 rounded-lg object-cover"
            />
            <span className="text-xl font-bold text-brand-600">{t('common.brandName')}</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-brand-600 ${
                  pathname.startsWith(link.href)
                    ? 'text-brand-600'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <NotificationBadge />
            <LanguageToggle />
            <ThemeToggle />
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {t('auth.loginShort')}
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
            >
              {t('auth.register')}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>
      <BackToTop />

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/logo.png"
                  alt={t('common.brandName')}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-lg object-cover"
                />
                <span className="text-lg font-bold text-brand-600">{t('common.brandName')}</span>
              </Link>
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{t('footer.tagline')}</p>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-bold text-gray-900 dark:text-gray-100">
                {t('footer.browse')}
              </h4>
              <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <Link href="/services" className="block hover:text-brand-600">
                  {t('nav.services')}
                </Link>
                <Link href="/technicians" className="block hover:text-brand-600">
                  {t('nav.technicians')}
                </Link>
                <Link href="/marketplace" className="block hover:text-brand-600">
                  {t('nav.marketplace')}
                </Link>
                <Link href="/blog" className="block hover:text-brand-600">
                  {t('nav.blog')}
                </Link>
              </div>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-bold text-gray-900 dark:text-gray-100">
                {t('footer.help')}
              </h4>
              <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <Link href="/ai-chat" className="block hover:text-brand-600">
                  {t('footer.chatBeautyGalaxy')}
                </Link>
                <Link href="/bookings/create" className="block hover:text-brand-600">
                  {t('button.bookNow')}
                </Link>
                <Link href="/subscription-boxes" className="block hover:text-brand-600">
                  {t('footer.subscriptionBoxes')}
                </Link>
                <Link href="/services/surprise-me" className="block hover:text-brand-600">
                  {t('footer.surpriseMe')}
                </Link>
              </div>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-bold text-gray-900 dark:text-gray-100">
                {t('footer.quickLinks')}
              </h4>
              <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <Link href="/login" className="block hover:text-brand-600">
                  {t('auth.login')}
                </Link>
                <Link href="/register" className="block hover:text-brand-600">
                  {t('auth.register')}
                </Link>
                <Link href="/dashboard" className="block hover:text-brand-600">
                  {t('nav.dashboard')}
                </Link>
                <Link href="/gift-cards" className="block hover:text-brand-600">
                  {t('nav.giftCards')}
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-10 border-t border-gray-100 pt-6 text-center text-sm text-gray-400 dark:border-gray-800">
            © {new Date().getFullYear()} {t('common.brandName')}. {t('footer.rights')}
          </div>
        </div>
      </footer>
      <PWAInstallPrompt />
    </div>
  );
}
