'use client';

/* eslint-disable jsx-a11y/aria-role */ // 'role' prop is a user role, not an ARIA attribute

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '@galaxy/ui';
import { api } from '@/lib/trpc';
import { useLocale } from '@/components/LocaleProvider';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';
import { customerNavGroups, customerLinks, type NavLink } from './nav-groups';

// Phase 3 sprint 4 — sidebar group collapse state (per viewer).
const COLLAPSED_KEY = 'dashboard-nav-collapsed';

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
  const logoutMut = api.auth.logout.useMutation();
  const { t } = useLocale();
  const links =
    userRole === 'ADMIN' ? adminLinks : userRole === 'TECHNICIAN' ? technicianLinks : customerLinks;

  // Phase 3 sprint 4 — collapsible groups (customer sidebar only).
  // Default: every group collapsed except the one holding the active route.
  const defaultCollapsed = Object.fromEntries(
    customerNavGroups.map((group) => [
      group.key,
      !group.links.some((link) => pathname.startsWith(link.href)),
    ]),
  ) as Record<string, boolean>;
  const [collapsed, setCollapsed] = useState<Record<string, boolean> | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(COLLAPSED_KEY);
      setCollapsed(raw ? (JSON.parse(raw) as Record<string, boolean>) : defaultCollapsed);
    } catch {
      setCollapsed(defaultCollapsed);
    }
    // Read once on mount — defaultCollapsed at mount reflects the entry route.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isGroupOpen = (key: string) => !(collapsed ?? defaultCollapsed)[key];

  // Phase 3 sprint 4 — while the §3.6 onboarding tour is open, expand every
  // group so the tour's sidebar targets (aside a[href=…]) exist in the DOM.
  // The dashboard page broadcasts 'gob:tour' when the tour opens/closes.
  const [tourOpen, setTourOpen] = useState(false);
  useEffect(() => {
    const onTour = (e: Event) => {
      setTourOpen(Boolean((e as CustomEvent<{ open?: boolean }>).detail?.open));
    };
    window.addEventListener('gob:tour', onTour);
    return () => window.removeEventListener('gob:tour', onTour);
  }, []);
  const groupOpen = (key: string) => tourOpen || isGroupOpen(key);
  const toggleGroup = (key: string) => {
    setCollapsed((prev) => {
      const base = prev ?? defaultCollapsed;
      const next = { ...base, [key]: !base[key] };
      try {
        localStorage.setItem(COLLAPSED_KEY, JSON.stringify(next));
      } catch {
        // storage unavailable — session-only state
      }
      return next;
    });
  };

  const handleLogout = async () => {
    if (!window.confirm(t('confirm.logout'))) return;
    // Server logout clears the HttpOnly cookies (gob_access/gob_refresh)
    // via Set-Cookie; local logout only clears gob_user + state. Without
    // the server call the middleware keeps redirecting /login back to
    // /dashboard and the old session stays valid.
    try {
      await logoutMut.mutateAsync({});
    } catch {
      // Best-effort: cookies may already be gone; local cleanup proceeds.
    }
    await logout();
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 border-e border-edge bg-white p-4 md:block dark:border-gray-800 dark:bg-gray-950">
        <Link href="/" className="mb-8 flex shrink-0 items-center gap-2">
          <Image
            src="/logo.png"
            alt={t('common.brandName')}
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 rounded-lg object-cover"
          />
          <span className="whitespace-nowrap text-xl font-bold leading-none text-brand-600">
            {t('common.brandName')}
          </span>
        </Link>
        <nav className="space-y-1">
          {userRole === 'CUSTOMER'
            ? customerNavGroups.map((group) => (
                <div key={group.key}>
                  <button
                    type="button"
                    data-testid="nav-group-toggle"
                    onClick={() => toggleGroup(group.key)}
                    aria-expanded={groupOpen(group.key)}
                    aria-controls={`nav-group-${group.key}`}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:hover:bg-gray-900 ${
                      group.links.some((link) => pathname.startsWith(link.href))
                        ? 'text-brand-700 dark:text-brand-300'
                        : 'text-text-primary dark:text-gray-100'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span aria-hidden>{group.icon}</span>
                      {t(group.key)}
                    </span>
                    <span
                      aria-hidden
                      className={`transition-transform motion-reduce:transition-none ${
                        groupOpen(group.key) ? 'rotate-90 rtl:-rotate-90' : ''
                      }`}
                    >
                      ›
                    </span>
                  </button>
                  {groupOpen(group.key) && (
                    <div
                      id={`nav-group-${group.key}`}
                      className="mt-1 ms-3 space-y-1 border-s border-edge ps-3 dark:border-gray-800"
                    >
                      {group.links.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                            pathname.startsWith(link.href)
                              ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                              : 'text-text-secondary hover:bg-surface-muted dark:text-text-tertiary dark:hover:bg-gray-900'
                          }`}
                        >
                          <span>{link.icon}</span>
                          {t(link.key)}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))
            : links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    pathname.startsWith(link.href)
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                      : 'text-text-secondary hover:bg-surface-muted dark:text-text-tertiary dark:hover:bg-gray-900'
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
        <header className="sticky top-0 z-30 flex items-center justify-end gap-2 border-b border-edge bg-white/80 px-4 py-2 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
          <LanguageToggle />
          <ThemeToggle />
        </header>
        <main
          data-testid="dashboard-content"
          className="flex-1 overflow-auto bg-surface-muted p-4 pb-20 md:p-6 md:pb-6 dark:bg-gray-950 animate-fade-in"
        >
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 start-0 end-0 z-50 border-t border-edge bg-white dark:border-gray-800 dark:bg-gray-950 md:hidden">
        <div className="flex overflow-x-auto">
          {links.slice(0, 5).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex min-w-[64px] flex-1 flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-medium transition-colors ${
                pathname.startsWith(link.href) ? 'text-brand-600' : 'text-text-tertiary'
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
