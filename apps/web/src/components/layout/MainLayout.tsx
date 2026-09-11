'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { TranslationKey } from '@galaxy/shared';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';
import { BackToTop } from '@/components/BackToTop';
import { NotificationBadge } from '@/components/NotificationBadge';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { useLocale } from '@/components/LocaleProvider';

type HeaderLink = { href: string; key: TranslationKey };

// Phase 3 sprint 4 — public header IA: 7 top-level items, everything else
// grouped under "More". The old flat 18-link row read as a sitemap dump.
const primaryLinks: HeaderLink[] = [
  { href: '/', key: 'nav.home' },
  { href: '/services', key: 'nav.services' },
  { href: '/bookings/create', key: 'button.bookNow' },
  { href: '/discover', key: 'nav.discover' },
  { href: '/marketplace', key: 'nav.marketplace' },
  { href: '/womens-services', key: 'nav.wellness-hub' },
];

const venueLinks: HeaderLink[] = [
  { href: '/stores', key: 'nav.stores' },
  { href: '/clinics', key: 'nav.clinics' },
  { href: '/gyms', key: 'nav.gyms' },
  { href: '/trainers', key: 'nav.trainers' },
  { href: '/nail-bars', key: 'nav.nailBars' },
  { href: '/barberettes', key: 'nav.barberettes' },
];

const moreLinks: HeaderLink[] = [
  { href: '/beauty-shorts', key: 'nav.reels' },
  { href: '/technicians', key: 'nav.technicians' },
  { href: '/skin-analysis', key: 'nav.skin-analysis' },
  { href: '/gift-cards', key: 'nav.giftCards' },
  { href: '/search', key: 'nav.search' },
  { href: '/mommy-and-me', key: 'nav.mommyAndMe' },
  { href: '/bundles', key: 'nav.bundles' },
  { href: '/lookbook', key: 'nav.lookbook' },
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
  const [moreOpen, setMoreOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Close the More dropdown on click-outside and Escape (disclosure pattern).
  useEffect(() => {
    if (!moreOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!moreRef.current?.contains(e.target as Node)) setMoreOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMoreOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [moreOpen]);

  // Escape closes the mobile drawer.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  const linkClass = (href: string) =>
    `text-sm font-medium transition-colors hover:text-brand-600 ${
      pathname.startsWith(href) && href !== '/' ? 'text-brand-600' : 'text-text-secondary'
    }`;

  const renderDrawerLinks = (links: HeaderLink[]) =>
    links.map((link) => (
      <Link
        key={link.href}
        href={link.href}
        onClick={() => setDrawerOpen(false)}
        className="block rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-muted dark:text-text-tertiary dark:hover:bg-gray-900"
      >
        {t(link.key)}
      </Link>
    ));

  return (
    <div className="min-h-screen bg-surface">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-edge bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-3">
            {/* Mobile drawer toggle */}
            <button
              type="button"
              data-testid="nav-drawer-toggle"
              className="rounded-lg p-2 text-text-secondary hover:bg-surface-muted md:hidden"
              onClick={() => setDrawerOpen(true)}
              aria-label={t('nav.menu')}
            >
              ☰
            </button>
            <Link href="/" className="flex shrink-0 items-center gap-2">
              <Image
                src="/logo.png"
                alt={t('common.brandName')}
                width={40}
                height={40}
                className="h-10 w-10 shrink-0 rounded-lg object-cover"
              />
              <span className="hidden whitespace-nowrap text-xl font-bold leading-none text-brand-600 sm:block">
                {t('common.brandName')}
              </span>
            </Link>
          </div>

          <nav className="hidden items-center gap-5 md:flex" aria-label={t('nav.menu')}>
            {primaryLinks.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass(link.href)}>
                {t(link.key)}
              </Link>
            ))}
            <div className="relative" ref={moreRef}>
              <button
                type="button"
                data-testid="nav-more-toggle"
                onClick={() => setMoreOpen((v) => !v)}
                aria-expanded={moreOpen}
                aria-controls="nav-more-menu"
                className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-brand-600 ${
                  moreOpen ? 'text-brand-600' : 'text-text-secondary'
                }`}
              >
                {t('nav.more')}
                <span
                  aria-hidden
                  className={`transition-transform ${moreOpen ? 'rotate-180' : ''}`}
                >
                  ▾
                </span>
              </button>
              {moreOpen && (
                <div
                  id="nav-more-menu"
                  data-testid="nav-more-menu"
                  className="absolute end-0 top-full mt-2 w-64 rounded-2xl border border-edge bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-900"
                >
                  {moreLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMoreOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-muted dark:text-text-tertiary dark:hover:bg-gray-800"
                    >
                      {t(link.key)}
                    </Link>
                  ))}
                  <div className="mt-1 border-t border-edge-muted pt-1 dark:border-gray-800">
                    <p className="px-3 py-1 text-xs font-bold text-text-tertiary">
                      {t('nav.venues')}
                    </p>
                    {venueLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMoreOpen(false)}
                        className="block rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-muted dark:text-text-tertiary dark:hover:bg-gray-800"
                      >
                        {t(link.key)}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          <div className="flex items-center gap-3">
            <NotificationBadge />
            <LanguageToggle />
            <ThemeToggle />
            <Link
              href="/login"
              className="hidden rounded-lg px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-muted sm:block dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {t('auth.loginShort')}
            </Link>
            <Link
              href="/register"
              className="hidden rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 sm:block"
            >
              {t('auth.register')}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile drawer — public pages previously had no nav below md */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={t('nav.menu')}
        >
          <div aria-hidden className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-y-0 start-0 w-72 overflow-y-auto bg-white p-4 dark:bg-gray-950">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-lg font-bold text-brand-600">{t('common.brandName')}</span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label={t('common.close')}
                className="rounded-lg p-2 text-text-secondary hover:bg-surface-muted"
              >
                ✕
              </button>
            </div>
            <div className="space-y-1">
              {renderDrawerLinks(primaryLinks)}
              <div className="mt-3 border-t border-edge-muted pt-2 dark:border-gray-800">
                {renderDrawerLinks(moreLinks)}
              </div>
              <div className="mt-3 border-t border-edge-muted pt-2 dark:border-gray-800">
                <p className="px-3 py-1 text-xs font-bold text-text-tertiary">{t('nav.venues')}</p>
                {renderDrawerLinks(venueLinks)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main>{children}</main>
      <BackToTop />

      {/* Footer */}
      <footer className="border-t border-edge bg-white dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link href="/" className="flex shrink-0 items-center gap-2">
                <Image
                  src="/logo.png"
                  alt={t('common.brandName')}
                  width={40}
                  height={40}
                  className="h-10 w-10 shrink-0 rounded-lg object-cover"
                />
                <span className="whitespace-nowrap text-lg font-bold leading-none text-brand-600">
                  {t('common.brandName')}
                </span>
              </Link>
              <p className="mt-3 text-sm text-text-secondary">{t('footer.tagline')}</p>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-bold text-text-primary">{t('footer.browse')}</h4>
              <div className="space-y-2 text-sm text-text-secondary">
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
              <h4 className="mb-3 text-sm font-bold text-text-primary">{t('footer.help')}</h4>
              <div className="space-y-2 text-sm text-text-secondary">
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
              <h4 className="mb-3 text-sm font-bold text-text-primary">{t('footer.quickLinks')}</h4>
              <div className="space-y-2 text-sm text-text-secondary">
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
          <div className="mt-10 border-t border-edge-muted pt-6 text-center text-sm text-text-tertiary dark:border-gray-800">
            © {new Date().getFullYear()} {t('common.brandName')}. {t('footer.rights')}
          </div>
        </div>
      </footer>
      <PWAInstallPrompt />
    </div>
  );
}
