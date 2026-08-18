'use client';

import Link from 'next/link';
import { api } from '@/lib/trpc';
import type { RouterOutput } from '@galaxy/api/client';
import {
  Card,
  DashboardSkeleton,
  ErrorAlert,
  formatCurrency,
  StatCard,
  PageContainer,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import { type TranslationKey } from '@galaxy/shared';

type AdminHealth = RouterOutput['adminTools']['health'];

const QUICK_LINKS: Array<{ href: string; labelKey: TranslationKey; icon: string }> = [
  { href: '/admin/users', labelKey: 'admin.dashboard.quick-users', icon: '' },
  { href: '/admin/technicians', labelKey: 'admin.dashboard.quick-technicians', icon: '‍' },
  { href: '/admin/services', labelKey: 'admin.dashboard.quick-services', icon: '' },
  { href: '/admin/categories', labelKey: 'admin.dashboard.quick-categories', icon: '' },
  { href: '/admin/bookings', labelKey: 'admin.dashboard.quick-bookings', icon: '' },
  { href: '/admin/finance', labelKey: 'admin.dashboard.quick-finance', icon: '' },
  { href: '/admin/disputes', labelKey: 'admin.dashboard.quick-disputes', icon: '' },
  { href: '/admin/zatca', labelKey: 'admin.dashboard.quick-zatca', icon: '' },
  { href: '/admin/analytics', labelKey: 'admin.dashboard.quick-analytics', icon: '' },
  { href: '/admin/settings', labelKey: 'admin.dashboard.quick-settings', icon: '️' },
];

export default function AdminDashboardPage(): JSX.Element {
  const { t, locale } = useLocale();
  const { data, isLoading, isError, refetch } = api.adminTools.health.useQuery();
  const stats = data as AdminHealth;

  if (isLoading) {
    return (
      <DashboardLayout userRole="ADMIN">
        <PageContainer width="wide">
          <DashboardSkeleton />
        </PageContainer>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout userRole="ADMIN">
        <PageContainer width="wide">
          <ErrorAlert message={t('admin.dashboard.load-error')} onRetry={() => refetch()} />
        </PageContainer>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="ADMIN">
      <PageContainer width="wide">
        <h1 className="text-2xl font-bold text-text-primary">{t('admin.dashboard.title')}</h1>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label={t('admin.dashboard.total-users')}
            value={Number(stats?.users ?? 0).toLocaleString(locale === 'en' ? 'en-GB' : 'ar-SA')}
            icon=""
          />
          <StatCard
            label={t('admin.dashboard.technicians')}
            value={Number(stats?.technicians ?? 0).toLocaleString(
              locale === 'en' ? 'en-GB' : 'ar-SA',
            )}
            icon="‍"
          />
          <StatCard
            label={t('admin.dashboard.active-services')}
            value={Number(stats?.services ?? 0).toLocaleString(locale === 'en' ? 'en-GB' : 'ar-SA')}
            icon=""
          />
          <StatCard
            label={t('admin.dashboard.open-disputes')}
            value={Number(stats?.openDisputes ?? 0).toLocaleString(
              locale === 'en' ? 'en-GB' : 'ar-SA',
            )}
            icon=""
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label={t('admin.dashboard.total-bookings')}
            value={Number(stats?.totalBookings ?? 0).toLocaleString(
              locale === 'en' ? 'en-GB' : 'ar-SA',
            )}
            icon=""
          />
          <StatCard
            label={t('admin.dashboard.bookings-today')}
            value={Number(stats?.bookingsToday ?? 0).toLocaleString(
              locale === 'en' ? 'en-GB' : 'ar-SA',
            )}
            icon=""
          />
          <StatCard
            label={t('admin.dashboard.completion-rate')}
            value={`${stats?.completionRate ?? 0}%`}
            icon=""
          />
          <StatCard
            label={t('admin.dashboard.revenue')}
            value={formatCurrency(Number(stats?.totalRevenue ?? 0))}
            icon=""
          />
        </div>

        {/* Quick Links */}
        <Card padding="md">
          <h3 className="mb-3 text-lg font-semibold text-text-primary">
            {t('admin.dashboard.quick-actions')}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 rounded-lg border border-edge bg-surface p-3 text-sm font-medium text-text-primary transition-colors hover:border-brand-300 hover:bg-brand-50 dark:hover:border-brand-700 dark:hover:bg-brand-950"
              >
                <span aria-hidden="true">{link.icon}</span>
                {t(link.labelKey)}
              </Link>
            ))}
          </div>
        </Card>

        {/* System Info */}
        <Card padding="md">
          <h3 className="mb-3 text-lg font-semibold text-text-primary">
            {t('admin.dashboard.system-info')}
          </h3>
          <div className="grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-lg bg-surface-muted p-3 dark:bg-gray-800">
              <span className="text-text-secondary">Node.js</span>
              <p className="font-mono font-semibold text-text-primary">
                {String(stats?.nodeVersion ?? '-')}
              </p>
            </div>
            <div className="rounded-lg bg-surface-muted p-3 dark:bg-gray-800">
              <span className="text-text-secondary">{t('admin.dashboard.uptime')}</span>
              <p className="font-semibold text-text-primary">
                {t('admin.dashboard.uptime-minutes', {
                  minutes: Math.round(Number(stats?.uptime ?? 0) / 60),
                })}
              </p>
            </div>
            <div className="rounded-lg bg-surface-muted p-3 dark:bg-gray-800">
              <span className="text-text-secondary">{t('admin.dashboard.database')}</span>
              <p className="font-semibold text-success">
                {String(stats?.dbStatus ?? t('admin.dashboard.connected'))}
              </p>
            </div>
          </div>
        </Card>
      </PageContainer>
    </DashboardLayout>
  );
}
