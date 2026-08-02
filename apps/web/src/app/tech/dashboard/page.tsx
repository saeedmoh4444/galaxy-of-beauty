/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Link from 'next/link';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button, formatCurrency } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function TechDashboardPage(): JSX.Element {
  const pending = api.bookings.getTechnicianPending.useQuery();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const earnings = api.analytics.technicianEarnings.useQuery({ days: 30 }) as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = api.auth.me.useQuery() as any;
  const transition = api.bookings.transition.useMutation({ onSuccess: () => { pending.refetch(); } });

  const todayEarnings = earnings.data?.today || 0;
  const weekEarnings = earnings.data?.week || 0;
  const monthEarnings = earnings.data?.month || 0;
  const rating = profile?.technician?.ratingAvg || 0;
  const completedBookings = profile?.technician?.completedBookings || 0;

  return (
    <DashboardLayout role="TECHNICIAN">
      <div className="mx-auto max-w-5xl space-y-6">
        <h1 className="text-2xl font-bold">لوحة تحكم الفنية</h1>

        {/* Stats */}
        {earnings.isLoading ? <div className="grid gap-4 md:grid-cols-4">{Array.from({ length: 4 }, (_, i) => <CardSkeleton key={i} />)}</div>
        : earnings.isError ? <ErrorAlert message="فشل التحميل" onRetry={() => earnings.refetch()} />
        : (
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="text-center"><p className="text-sm text-gray-500">أرباح اليوم</p><p className="text-2xl font-bold text-green-600">{formatCurrency(Number(todayEarnings))}</p></Card>
            <Card className="text-center"><p className="text-sm text-gray-500">أرباح الأسبوع</p><p className="text-2xl font-bold text-brand-600">{formatCurrency(Number(weekEarnings))}</p></Card>
            <Card className="text-center"><p className="text-sm text-gray-500">أرباح الشهر</p><p className="text-2xl font-bold text-purple-600">{formatCurrency(Number(monthEarnings))}</p></Card>
            <Card className="text-center"><p className="text-sm text-gray-500">التقييم</p><p className="text-2xl font-bold text-amber-600">⭐ {Number(rating).toFixed(1)}</p></Card>
          </div>
        )}

        {/* Performance Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="text-center" padding="md">
            <span className="text-3xl">📅</span>
            <p className="text-2xl font-bold text-brand-600 mt-1">{completedBookings}</p>
            <p className="text-sm text-gray-500">حجز مكتمل</p>
          </Card>
          <Card className="text-center" padding="md">
            <span className="text-3xl">⭐</span>
            <p className="text-2xl font-bold text-amber-600 mt-1">{Number(rating).toFixed(1)}</p>
            <p className="text-sm text-gray-500">تقييم العملاء</p>
          </Card>
          <Card className="text-center" padding="md">
            <span className="text-3xl">✅</span>
            <p className="text-2xl font-bold text-green-600 mt-1">{profile?.technician?.kycStatus === 'VERIFIED' ? 'موثقة' : 'قيد المراجعة'}</p>
            <p className="text-sm text-gray-500">حالة التوثيق</p>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Link href="/tech/slots"><Button variant="outline">📅 إدارة المواعيد</Button></Link>
          <Link href="/tech/profile"><Button variant="outline">👤 تعديل الملف</Button></Link>
          <Link href="/tech/earnings"><Button variant="outline">💰 الأرباح</Button></Link>
          <Link href="/tech/calendar"><Button variant="outline">📆 تقويم</Button></Link>
        </div>

        {/* Pending Bookings */}
        <h2 className="text-lg font-semibold">📋 طلبات الحجز المعلقة</h2>
        {pending.isLoading ? <CardSkeleton />
        : pending.isError ? <ErrorAlert message="فشل التحميل" onRetry={() => pending.refetch()} />
        : !pending.data || (pending.data as unknown[]).length === 0 ? <EmptyState title="لا توجد طلبات معلقة" />
        : <div className="space-y-3">{(pending.data as unknown as Array<Record<string, any>>).slice(0, 10).map((b: Record<string, any>) => (
          <Card key={b.id} padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{b.bookingCode}</p>
                <p className="text-sm text-gray-500">{new Date(b.startAt).toLocaleDateString('ar-SA')} · {formatCurrency(Number(b.totalAmount))}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => transition.mutate({ id: b.id as number, action: 'accept' })} loading={transition.isPending}>قبول</Button>
                <Button size="sm" variant="danger" onClick={() => transition.mutate({ id: b.id as number, action: 'reject' })} loading={transition.isPending}>رفض</Button>
              </div>
            </div>
          </Card>
        ))}</div>}
      </div>
    </DashboardLayout>
  );
}
