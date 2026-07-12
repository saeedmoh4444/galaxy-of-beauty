'use client';

import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, formatCurrency } from '@galaxy/shared';

export default function AdminDashboardPage(): JSX.Element {
  const stats = api.admin.dashboardStats.useQuery({} as never);

  if (stats.isLoading) return <div className="space-y-6"><div className="grid gap-4 md:grid-cols-4">{Array.from({ length: 4 }, (_, i) => <CardSkeleton key={i} />)}</div><CardSkeleton /><CardSkeleton /></div>;
  if (stats.error) return <ErrorAlert message={stats.error.message} onRetry={() => stats.refetch()} />;

  const d = stats.data as unknown as Record<string, unknown>;
  const recentBookings = (d?.recentBookings as unknown as Record<string, unknown>[]) ?? [];
  const topTechnicians = (d?.topTechnicians as unknown as Record<string, unknown>[]) ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">لوحة الإدارة</h1>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="text-center"><p className="text-sm text-gray-500">المستخدمين</p><p className="text-2xl font-bold text-brand-600">{d?.totalUsers as number ?? 0}</p></Card>
        <Card className="text-center"><p className="text-sm text-gray-500">الفنيات</p><p className="text-2xl font-bold text-green-600">{d?.totalTechnicians as number ?? 0}</p></Card>
        <Card className="text-center"><p className="text-sm text-gray-500">الحجوزات</p><p className="text-2xl font-bold text-amber-600">{d?.totalBookings as number ?? 0}</p></Card>
        <Card className="text-center"><p className="text-sm text-gray-500">الإيرادات</p><p className="text-2xl font-bold text-purple-600">{formatCurrency(Number(d?.totalRevenue ?? 0))}</p></Card>
      </div>

      <Card><h2 className="mb-3 text-lg font-semibold">آخر الحجوزات</h2>
        {recentBookings.length === 0 ? <p className="text-gray-500">لا توجد حجوزات</p> : (
          <div className="space-y-2">{recentBookings.map((b: Record<string, unknown>) => (
            <div key={b.id as number} className="flex items-center justify-between border-b border-gray-100 pb-2 dark:border-gray-800">
              <span className="font-medium">{b.bookingCode as string}</span>
              <span className="text-sm text-gray-500">{new Date(b.createdAt as string).toLocaleDateString('ar-SA')}</span>
              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs text-brand-700">{b.status as string}</span>
              <span className="font-semibold">{formatCurrency(Number(b.totalAmount ?? 0))}</span>
            </div>
          ))}</div>
        )}
      </Card>

      <Card><h2 className="mb-3 text-lg font-semibold">أفضل الفنيات</h2>
        {topTechnicians.length === 0 ? <p className="text-gray-500">لا توجد فنيات</p> : (
          <div className="space-y-2">{topTechnicians.map((t: Record<string, unknown>) => (
            <div key={t.id as number} className="flex items-center justify-between border-b border-gray-100 pb-2 dark:border-gray-800">
              <span className="font-medium">{t.name as string}</span>
              <span className="text-sm text-gray-500">⭐ {t.ratingAvg as number ?? 0}</span>
              <span className="text-sm text-gray-500">{t.completedBookings as number} حجز</span>
            </div>
          ))}</div>
        )}
      </Card>
    </div>
  );
}
