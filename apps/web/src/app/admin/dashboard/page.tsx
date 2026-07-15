'use client';

import Link from 'next/link';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, formatCurrency } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function AdminDashboardPage(): JSX.Element {
  const { data, isLoading, isError, refetch } = api.adminTools.health.useQuery({} as never);
  const stats = data as unknown as Record<string, unknown>;

  if (isLoading) return <DashboardLayout role="ADMIN"><div className="space-y-6">{Array.from({ length: 4 }, (_, i) => <CardSkeleton key={i} />)}</div></DashboardLayout>;
  if (isError) return <DashboardLayout role="ADMIN"><ErrorAlert message="فشل تحميل لوحة التحكم" onRetry={() => refetch()} /></DashboardLayout>;

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">لوحة التحكم</h1>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="إجمالي المستخدمين" value={Number(stats?.users ?? 0).toLocaleString('ar-SA')} color="brand" />
          <StatCard label="الفنيات" value={Number(stats?.technicians ?? 0).toLocaleString('ar-SA')} color="purple" />
          <StatCard label="الخدمات النشطة" value={Number(stats?.services ?? 0).toLocaleString('ar-SA')} color="indigo" />
          <StatCard label="نزاعات مفتوحة" value={Number(stats?.openDisputes ?? 0).toLocaleString('ar-SA')} color="red" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="إجمالي الحجوزات" value={Number(stats?.totalBookings ?? 0).toLocaleString('ar-SA')} color="green" />
          <StatCard label="حجوزات اليوم" value={Number(stats?.bookingsToday ?? 0).toLocaleString('ar-SA')} color="amber" />
          <StatCard label="نسبة الإكمال" value={`${stats?.completionRate ?? 0}%`} color="teal" />
          <StatCard label="الإيرادات" value={formatCurrency(Number(stats?.totalRevenue ?? 0))} color="blue" />
        </div>

        {/* Quick Links */}
        <Card padding="md">
          <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">⚡ إجراءات سريعة</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { href: '/admin/users', label: '👥 إدارة المستخدمين' },
              { href: '/admin/technicians', label: '👩‍🎨 إدارة الفنيات' },
              { href: '/admin/services', label: '💄 إدارة الخدمات' },
              { href: '/admin/categories', label: '📂 إدارة الأقسام' },
              { href: '/admin/bookings', label: '📅 الحجوزات' },
              { href: '/admin/finance', label: '💰 المالية' },
              { href: '/admin/disputes', label: '⚡ النزاعات' },
              { href: '/admin/zatca', label: '🧾 زاتكا' },
              { href: '/admin/analytics', label: '📈 التحليلات' },
              { href: '/admin/settings', label: '⚙️ الإعدادات' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg border border-gray-200 p-3 text-sm font-medium text-gray-700 transition-colors hover:border-brand-300 hover:bg-brand-50 dark:border-gray-700 dark:text-gray-300 dark:hover:border-brand-700 dark:hover:bg-brand-950"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </Card>

        {/* System Info */}
        <Card padding="md">
          <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">معلومات النظام</h3>
          <div className="grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <span className="text-gray-500">Node.js</span>
              <p className="font-mono font-semibold">{String(stats?.nodeVersion ?? '-')}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <span className="text-gray-500">مدة التشغيل</span>
              <p className="font-semibold">{Math.round(Number(stats?.uptime ?? 0) / 60)} دقيقة</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <span className="text-gray-500">قاعدة البيانات</span>
              <p className="font-semibold text-green-600">{String(stats?.dbStatus ?? 'متصل')}</p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    brand: 'text-brand-600', purple: 'text-purple-600', indigo: 'text-indigo-600',
    red: 'text-red-600', green: 'text-green-600', amber: 'text-amber-600',
    teal: 'text-teal-600', blue: 'text-blue-600',
  };
  return (
    <Card padding="md" className="text-center">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-3xl font-bold ${colors[color] || 'text-gray-600'}`}>{value}</p>
    </Card>
  );
}
