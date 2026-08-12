/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Link from 'next/link';
import { api } from '@/lib/trpc';
import {
  Card,
  ErrorAlert,
  EmptyState,
  Button,
  formatCurrency,
  StatCard,
  PageContainer,
  DashboardSkeleton,
  CardListSkeleton,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function TechDashboardPage(): JSX.Element {
  const pending = api.bookings.getTechnicianPending.useQuery();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const earnings = api.analytics.technicianEarnings.useQuery({ days: 30 }) as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = api.auth.me.useQuery() as any;
  const transition = api.bookings.transition.useMutation({
    onSuccess: () => {
      pending.refetch();
    },
  });

  const todayEarnings = earnings.data?.today || 0;
  const weekEarnings = earnings.data?.week || 0;
  const monthEarnings = earnings.data?.month || 0;
  const rating = profile?.technician?.ratingAvg || 0;
  const completedBookings = profile?.technician?.completedBookings || 0;

  return (
    <DashboardLayout role="TECHNICIAN">
      <PageContainer width="wide">
        <h1 className="text-2xl font-bold text-text-primary">لوحة تحكم الفنية</h1>

        {/* Stats */}
        {earnings.isLoading ? (
          <DashboardSkeleton />
        ) : earnings.isError ? (
          <ErrorAlert message="فشل التحميل" onRetry={() => earnings.refetch()} />
        ) : (
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard label="أرباح اليوم" value={formatCurrency(Number(todayEarnings))} icon="💰" />
            <StatCard
              label="أرباح الأسبوع"
              value={formatCurrency(Number(weekEarnings))}
              icon="📊"
            />
            <StatCard label="أرباح الشهر" value={formatCurrency(Number(monthEarnings))} icon="📈" />
            <StatCard label="التقييم" value={`⭐ ${Number(rating).toFixed(1)}`} icon="⭐" />
          </div>
        )}

        {/* Performance Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="حجوزات مكتملة" value={completedBookings} icon="📅" />
          <StatCard label="تقييم العملاء" value={Number(rating).toFixed(1)} icon="⭐" />
          <StatCard
            label="حالة التوثيق"
            value={profile?.technician?.kycStatus === 'VERIFIED' ? 'موثقة' : 'قيد المراجعة'}
            icon="✅"
          />
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Link href="/tech/slots">
            <Button variant="outline">📅 إدارة المواعيد</Button>
          </Link>
          <Link href="/tech/profile">
            <Button variant="outline">👤 تعديل الملف</Button>
          </Link>
          <Link href="/tech/earnings">
            <Button variant="outline">💰 الأرباح</Button>
          </Link>
          <Link href="/tech/calendar">
            <Button variant="outline">📆 تقويم</Button>
          </Link>
        </div>

        {/* Pending Bookings */}
        <h2 className="text-lg font-semibold text-text-primary">📋 طلبات الحجز المعلقة</h2>
        {pending.isLoading ? (
          <CardListSkeleton count={3} />
        ) : pending.isError ? (
          <ErrorAlert message="فشل التحميل" onRetry={() => pending.refetch()} />
        ) : !pending.data || (pending.data as unknown[]).length === 0 ? (
          <EmptyState title="لا توجد طلبات معلقة" />
        ) : (
          <div className="space-y-3">
            {(pending.data as unknown as Array<Record<string, any>>)
              .slice(0, 10)
              .map((b: Record<string, any>) => (
                <Card key={b.id} padding="md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-text-primary">{b.bookingCode}</p>
                      <p className="text-sm text-text-secondary">
                        {new Date(b.startAt).toLocaleDateString('ar-SA')} ·{' '}
                        {formatCurrency(Number(b.totalAmount))}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => transition.mutate({ id: b.id as number, action: 'accept' })}
                        loading={transition.isPending}
                      >
                        قبول
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => transition.mutate({ id: b.id as number, action: 'reject' })}
                        loading={transition.isPending}
                      >
                        رفض
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        )}
      </PageContainer>
    </DashboardLayout>
  );
}
