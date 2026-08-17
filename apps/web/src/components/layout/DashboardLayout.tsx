'use client';

/* eslint-disable jsx-a11y/aria-role */ // 'role' prop is a user role, not an ARIA attribute

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import type { TranslationKey } from '@galaxy/shared';
import { useAuth } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';

type NavLink = { href: string; key: TranslationKey; icon: string };

const customerLinks: NavLink[] = [
  { href: '/dashboard', key: 'nav.dashboard', icon: '' },
  { href: '/bookings', key: 'nav.myBookings', icon: '' },
  { href: '/bookings/create', key: 'nav.bookings.create', icon: '' },
  { href: '/wallet', key: 'nav.wallet', icon: '' },
  { href: '/wishlist', key: 'nav.wishlist', icon: '️' },
  { href: '/womens-services', key: 'nav.womens-services', icon: '' },
  { href: '/dna-beauty', key: 'nav.dna-beauty', icon: '' },
  { href: '/ride-hailing', key: 'nav.ride-hailing', icon: '' },
  { href: '/last-mile', key: 'nav.last-mile', icon: '' },
  { href: '/calendar-sync', key: 'nav.calendar-sync', icon: '️' },
  { href: '/bnpl', key: 'nav.bnpl', icon: '' },
  { href: '/tech-onboarding', key: 'nav.tech-onboarding', icon: '' },
  { href: '/ai-assistant', key: 'nav.ai-assistant', icon: '' },
  { href: '/beauty-bingo', key: 'nav.beauty-bingo', icon: '' },
  { href: '/service-wishlist', key: 'nav.service-wishlist', icon: '' },
  { href: '/gift-card-market', key: 'nav.gift-card-market', icon: '' },
  { href: '/live-chat', key: 'nav.live-chat', icon: '' },
  { href: '/vendor-portal', key: 'nav.vendor-portal', icon: '' },
  { href: '/certification-quiz', key: 'nav.certification-quiz', icon: '' },
  { href: '/tech-waitlist', key: 'nav.tech-waitlist', icon: '' },
  { href: '/night-mode', key: 'nav.night-mode', icon: '' },
  { href: '/travel-kit', key: 'nav.travel-kit', icon: '' },
  { href: '/expiry-tracker', key: 'nav.expiry-tracker', icon: '️' },
  { href: '/price-drop-alerts', key: 'nav.price-drop-alerts', icon: '' },
  { href: '/loyalty-punch-card', key: 'nav.loyalty-punch-card', icon: '' },
  { href: '/routine-scheduler', key: 'nav.routine-scheduler', icon: '' },
  { href: '/booking-checklist', key: 'nav.booking-checklist', icon: '' },
  { href: '/hair-color-sim', key: 'nav.hair-color-sim', icon: '‍️' },
  { href: '/spa-planner', key: 'nav.spa-planner', icon: '️' },
  { href: '/restock-reminder', key: 'nav.restock-reminder', icon: '' },
  { href: '/skin-diary', key: 'nav.skin-diary', icon: '' },
  { href: '/pen-pal', key: 'nav.pen-pal', icon: '' },
  { href: '/sale-alerts', key: 'nav.sale-alerts', icon: '' },
  { href: '/style-match', key: 'nav.style-match', icon: '' },
  { href: '/product-scanner', key: 'nav.product-scanner', icon: '' },
  { href: '/vip-membership', key: 'nav.vip-membership', icon: '' },
  { href: '/ai-routine', key: 'nav.ai-routine', icon: '' },
  { href: '/box-builder', key: 'nav.box-builder', icon: '' },
  { href: '/service-warranty', key: 'nav.service-warranty', icon: '️' },
  { href: '/wellness-tracker', key: 'nav.wellness-tracker', icon: '' },
  { href: '/home-service', key: 'nav.home-service', icon: '' },
  { href: '/beauty-analytics', key: 'nav.beauty-analytics', icon: '' },
  { href: '/birthday-rewards', key: 'nav.birthday-rewards', icon: '' },
  { href: '/post-care', key: 'nav.post-care', icon: '‍️' },
  { href: '/mood-board', key: 'nav.mood-board', icon: '' },
  { href: '/family-account', key: 'nav.family-account', icon: '‍‍' },
  { href: '/virtual-try-on', key: 'nav.virtual-try-on', icon: '' },
  { href: '/bridal-concierge', key: 'nav.bridal-concierge', icon: '' },
  { href: '/group-bookings', key: 'nav.group-bookings', icon: '‍️' },
  { href: '/challenges', key: 'nav.challenges', icon: '' },
  { href: '/loyalty', key: 'nav.loyalty', icon: '' },
  { href: '/promo', key: 'nav.promo', icon: '️' },
  { href: '/saved-cards', key: 'nav.saved-cards', icon: '' },
  { href: '/notifications', key: 'nav.notifications', icon: '' },
  { href: '/skin-analysis', key: 'nav.skin-analysis', icon: '' },
  { href: '/ai-chat', key: 'nav.ai-chat', icon: '' },
  { href: '/subscriptions', key: 'nav.subscriptions', icon: '' },
  { href: '/marketplace', key: 'nav.marketplace', icon: '️' },
  { href: '/subscription-boxes', key: 'nav.subscription-boxes', icon: '' },
  { href: '/cart', key: 'nav.cart', icon: '' },
  { href: '/cashback', key: 'nav.cashback', icon: '' },
  { href: '/social', key: 'nav.social', icon: '' },
  { href: '/video', key: 'nav.video', icon: '' },
  { href: '/smart-schedule', key: 'nav.smart-schedule', icon: '' },
  { href: '/profile', key: 'nav.profile', icon: '' },
  { href: '/addresses', key: 'nav.addresses', icon: '' },
];

const technicianLinks: NavLink[] = [
  { href: '/tech/dashboard', key: 'nav.tech.dashboard', icon: '' },
  { href: '/tech/slots', key: 'nav.tech.slots', icon: '' },
  { href: '/tech/bookings', key: 'nav.tech.bookings', icon: '' },
  { href: '/tech/earnings', key: 'nav.tech.earnings', icon: '' },
  { href: '/tech/performance', key: 'nav.tech.performance', icon: '' },
  { href: '/tech/wallet', key: 'nav.tech.wallet', icon: '' },
  { href: '/tech/waitlist', key: 'nav.tech.waitlist', icon: '' },
  { href: '/tech/gallery', key: 'nav.tech.gallery', icon: '️' },
  { href: '/tech/calendar', key: 'nav.tech.calendar', icon: '' },
  { href: '/tech/profile', key: 'nav.tech.profile', icon: '' },
];

const adminLinks: NavLink[] = [
  { href: '/admin/dashboard', key: 'nav.admin.dashboard', icon: '' },
  { href: '/admin/users', key: 'nav.admin.users', icon: '' },
  { href: '/admin/technicians', key: 'nav.admin.technicians', icon: '‍' },
  { href: '/admin/services', key: 'nav.admin.services', icon: '' },
  { href: '/admin/categories', key: 'nav.admin.categories', icon: '' },
  { href: '/admin/areas', key: 'nav.admin.areas', icon: '' },
  { href: '/admin/bookings', key: 'nav.admin.bookings', icon: '' },
  { href: '/admin/finance', key: 'nav.admin.finance', icon: '' },
  { href: '/admin/flash-deals', key: 'nav.admin.flash-deals', icon: '' },
  { href: '/admin/beauty-events', key: 'nav.admin.beauty-events', icon: '' },
  { href: '/admin/loyalty', key: 'nav.admin.loyalty', icon: '' },
  { href: '/admin/cms', key: 'nav.admin.cms', icon: '' },
  { href: '/admin/admin-tools', key: 'nav.admin.admin-tools', icon: '️' },
  { href: '/admin/group-bookings', key: 'nav.admin.group-bookings', icon: '' },
  { href: '/admin/disputes', key: 'nav.admin.disputes', icon: '' },
  { href: '/admin/analytics', key: 'nav.admin.analytics', icon: '' },
  { href: '/admin/zatca', key: 'nav.admin.zatca', icon: '' },
  { href: '/admin/settings', key: 'nav.admin.settings', icon: '️' },
];

export function DashboardLayout({
  children,
  userRole = 'CUSTOMER',
}: {
  children: ReactNode;
  /** User role for navigation items — not an ARIA attribute */
  userRole?: string;
}): JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { t } = useLocale();
  const links =
    userRole === 'ADMIN' ? adminLinks : userRole === 'TECHNICIAN' ? technicianLinks : customerLinks;

  const handleLogout = async () => {
    if (!window.confirm(t('confirm.logout'))) return;
    await logout();
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 border-e border-gray-200 bg-white p-4 md:block dark:border-gray-800 dark:bg-gray-950">
        <Link href="/" className="mb-8 flex items-center gap-2">
          <Image
            src="/logo.png"
            alt={t('common.brandName')}
            width={40}
            height={40}
            className="h-10 w-10 rounded-lg object-cover"
          />
          <span className="text-xl font-bold text-brand-600">{t('common.brandName')}</span>
        </Link>
        <nav className="space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                pathname.startsWith(link.href)
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900'
              }`}
            >
              <span>{link.icon}</span>
              {t(link.key)}
            </Link>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="mt-8 w-full rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
        >
          {t('auth.logout')}
        </button>
      </aside>

      {/* Content — header strip hosts the language/theme toggles on all breakpoints */}
      <div className="flex flex-1 flex-col overflow-auto">
        <header className="sticky top-0 z-30 flex items-center justify-end gap-2 border-b border-gray-200 bg-white/80 px-4 py-2 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
          <LanguageToggle />
          <ThemeToggle />
        </header>
        <main
          data-testid="dashboard-content"
          className="flex-1 overflow-auto bg-gray-50 p-4 pb-20 md:p-6 md:pb-6 dark:bg-gray-950 animate-fade-in"
        >
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 md:hidden">
        <div className="flex overflow-x-auto">
          {links.slice(0, 5).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex min-w-[64px] flex-1 flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-medium transition-colors ${
                pathname.startsWith(link.href) ? 'text-brand-600' : 'text-gray-400'
              }`}
            >
              <span className="text-lg">{link.icon}</span>
              <span className="truncate max-w-[56px]">{t(link.key)}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
