'use client';

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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card padding="md" className="text-center">
            <p className="text-sm text-gray-500">إجمالي المستخدمين</p>
            <p className="text-3xl font-bold text-brand-600">{Number(stats?.users ?? 0).toLocaleString('ar-SA')}</p>
          </Card>
          <Card padding="md" className="text-center">
            <p className="text-sm text-gray-500">إجمالي الحجوزات</p>
            <p className="text-3xl font-bold text-green-600">{Number(stats?.totalBookings ?? 0).toLocaleString('ar-SA')}</p>
          </Card>
          <Card padding="md" className="text-center">
            <p className="text-sm text-gray-500">حجوزات اليوم</p>
            <p className="text-3xl font-bold text-amber-600">{Number(stats?.bookingsToday ?? 0).toLocaleString('ar-SA')}</p>
          </Card>
          <Card padding="md" className="text-center">
            <p className="text-sm text-gray-500">الإيرادات (ر.س)</p>
            <p className="text-3xl font-bold text-blue-600">{formatCurrency(Number(stats?.totalRevenue ?? 0))}</p>
          </Card>
        </div>

        <Card padding="md">
          <h3 className="mb-3 text-lg font-semibold">معلومات النظام</h3>
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
