'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import type { TranslationKey } from '@galaxy/shared';
import { useAuth } from '@galaxy/ui';
import { api } from '@/lib/trpc';
import { useLocale } from '@/components/LocaleProvider';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';

const adminLinks: { href: string; key: TranslationKey; icon: string }[] = [
  { href: '/admin/dashboard', key: 'nav.admin.dashboard', icon: '' },
  { href: '/admin/users', key: 'nav.admin.users', icon: '' },
  { href: '/admin/technicians', key: 'nav.admin.technicians', icon: '' },
  { href: '/admin/categories', key: 'nav.admin.categories', icon: '' },
  { href: '/admin/services', key: 'nav.admin.services', icon: '' },
  { href: '/admin/bookings', key: 'nav.admin.bookings', icon: '' },
  { href: '/admin/disputes', key: 'nav.admin.disputes', icon: '️' },
  { href: '/admin/finance', key: 'nav.admin.finance', icon: '' },
  { href: '/admin/settings', key: 'nav.admin.settings', icon: '️' },
  { href: '/admin/gift-cards', key: 'nav.admin.giftCards', icon: '' },
  { href: '/admin/packages', key: 'nav.admin.packages', icon: '' },
  { href: '/admin/campaigns', key: 'nav.admin.campaigns', icon: '' },
  { href: '/admin/blog', key: 'nav.admin.blog', icon: '' },
  { href: '/admin/zatca', key: 'nav.admin.zatca', icon: '' },
  { href: '/admin/analytics', key: 'nav.admin.analytics', icon: '' },
  { href: '/admin/monitoring', key: 'nav.admin.monitoring', icon: '️' },
  { href: '/admin/feature-flags', key: 'nav.admin.featureFlags', icon: '' },
  { href: '/admin/audit-log', key: 'nav.admin.auditLog', icon: '' },
  { href: '/admin/reports', key: 'nav.admin.reports', icon: '' },
  { href: '/admin/areas', key: 'nav.admin.areas', icon: '' },
];

export default function AdminLayout({ children }: { children: ReactNode }): ReactNode {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const logoutMut = api.auth.logout.useMutation();
  const { t } = useLocale();

  // Redirect non-admins
  if (user && user.role !== 'ADMIN') {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 border-e border-edge bg-white p-4 md:block dark:border-gray-800 dark:bg-gray-950">
        <Link href="/admin/dashboard" className="mb-6 block text-lg font-bold text-brand-600">
          {t('admin.title')}
        </Link>
        <nav className="space-y-0.5">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname.startsWith(link.href)
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                  : 'text-text-secondary hover:bg-surface-muted dark:text-gray-400 dark:hover:bg-gray-900'
              }`}
            >
              <span>{link.icon}</span>
              {t(link.key)}
            </Link>
          ))}
        </nav>
        <div className="mt-6 border-t border-edge pt-4 dark:border-gray-800">
          <Link
            href="/dashboard"
            className="block rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-surface-muted dark:text-gray-400 dark:hover:bg-gray-900"
          >
            {t('admin.backToStore')}
          </Link>
          <button
            onClick={async () => {
              // Server logout clears the HttpOnly cookies; local logout
              // only clears gob_user + state (see DashboardLayout).
              try {
                await logoutMut.mutateAsync({});
              } catch {
                // Best-effort — proceed with local cleanup.
              }
              await logout();
              router.push('/login');
            }}
            className="mt-1 w-full rounded-lg px-3 py-2 text-start text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
          >
            {t('auth.logout')}
          </button>
        </div>
      </aside>
      <div className="flex flex-1 flex-col overflow-auto">
        <header className="sticky top-0 z-30 flex items-center justify-end gap-2 border-b border-edge bg-white/80 px-4 py-2 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
          <LanguageToggle />
          <ThemeToggle />
        </header>
        <main className="flex-1 overflow-auto bg-surface-muted p-6 dark:bg-gray-950">
          {children}
        </main>
      </div>
    </div>
  );
}
