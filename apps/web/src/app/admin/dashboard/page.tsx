'use client';

import Link from 'next/link';
import { api } from '@/lib/trpc';
import type { RouterOutput } from '@galaxy/api/client';
import { Card, DashboardSkeleton, ErrorAlert, formatCurrency, StatCard, PageContainer } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

type AdminHealth = RouterOutput['adminTools']['health'];

const QUICK_LINKS = [
  { href: '/admin/users', label: 'إدارة المستخدمين', icon: '👥' },
  { href: '/admin/technicians', label: 'إدارة الفنيات', icon: '👩‍🎨' },
  { href: '/admin/services', label: 'إدارة الخدمات', icon: '💄' },
  { href: '/admin/categories', label: 'إدارة الأقسام', icon: '📂' },
  { href: '/admin/bookings', label: 'الحجوزات', icon: '📅' },
  { href: '/admin/finance', label: 'المالية', icon: '💰' },
  { href: '/admin/disputes', label: 'النزاعات', icon: '⚡' },
  { href: '/admin/zatca', label: 'زاتكا', icon: '🧾' },
  { href: '/admin/analytics', label: 'التحليلات', icon: '📈' },
  { href: '/admin/settings', label: 'الإعدادات', icon: '⚙️' },
] as const;

export default function AdminDashboardPage(): JSX.Element {
  const { data, isLoading, isError, refetch } = api.adminTools.health.useQuery();
  const stats = data as AdminHealth;

  if (isLoading) {
    return (
      <DashboardLayout role="ADMIN">
        <PageContainer width="wide">
          <DashboardSkeleton />
        </PageContainer>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout role="ADMIN">
        <PageContainer width="wide">
          <ErrorAlert message="فشل تحميل لوحة التحكم" onRetry={() => refetch()} />
        </PageContainer>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="ADMIN">
      <PageContainer width="wide">
        <h1 className="text-2xl font-bold text-text-primary">لوحة التحكم</h1>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="إجمالي المستخدمين" value={Number(stats?.users ?? 0).toLocaleString('ar-SA')} icon="👥" />
          <StatCard label="الفنيات" value={Number(stats?.technicians ?? 0).toLocaleString('ar-SA')} icon="👩‍🎨" />
          <StatCard label="الخدمات النشطة" value={Number(stats?.services ?? 0).toLocaleString('ar-SA')} icon="💄" />
          <StatCard label="نزاعات مفتوحة" value={Number(stats?.openDisputes ?? 0).toLocaleString('ar-SA')} icon="⚡" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="إجمالي الحجوزات" value={Number(stats?.totalBookings ?? 0).toLocaleString('ar-SA')} icon="📅" />
          <StatCard label="حجوزات اليوم" value={Number(stats?.bookingsToday ?? 0).toLocaleString('ar-SA')} icon="📆" />
          <StatCard label="نسبة الإكمال" value={`${stats?.completionRate ?? 0}%`} icon="✅" />
          <StatCard label="الإيرادات" value={formatCurrency(Number(stats?.totalRevenue ?? 0))} icon="💰" />
        </div>

        {/* Quick Links */}
        <Card padding="md">
          <h3 className="mb-3 text-lg font-semibold text-text-primary">إجراءات سريعة</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 rounded-lg border border-edge bg-surface p-3 text-sm font-medium text-text-primary transition-colors hover:border-brand-300 hover:bg-brand-50 dark:hover:border-brand-700 dark:hover:bg-brand-950"
              >
                <span aria-hidden="true">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>
        </Card>

        {/* System Info */}
        <Card padding="md">
          <h3 className="mb-3 text-lg font-semibold text-text-primary">معلومات النظام</h3>
          <div className="grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-lg bg-surface-muted p-3 dark:bg-gray-800">
              <span className="text-text-secondary">Node.js</span>
              <p className="font-mono font-semibold text-text-primary">{String(stats?.nodeVersion ?? '-')}</p>
            </div>
            <div className="rounded-lg bg-surface-muted p-3 dark:bg-gray-800">
              <span className="text-text-secondary">مدة التشغيل</span>
              <p className="font-semibold text-text-primary">{Math.round(Number(stats?.uptime ?? 0) / 60)} دقيقة</p>
            </div>
            <div className="rounded-lg bg-surface-muted p-3 dark:bg-gray-800">
              <span className="text-text-secondary">قاعدة البيانات</span>
              <p className="font-semibold text-success">{String(stats?.dbStatus ?? 'متصل')}</p>
            </div>
          </div>
        </Card>
      </PageContainer>
    </DashboardLayout>
  );
}
