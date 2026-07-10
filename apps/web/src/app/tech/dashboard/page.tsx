'use client';

import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button, formatCurrency } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function TechDashboardPage(): JSX.Element {
  const pending = api.bookings.getTechnicianPending.useQuery();
  const earnings = api.analytics.technicianEarnings.useQuery({ days: 7 });
  const transition = api.bookings.transition.useMutation({
    onSuccess: () => { pending.refetch(); },
  });

  return (
    <DashboardLayout role="TECHNICIAN">
      <div className="mx-auto max-w-5xl space-y-6">
        <h1 className="text-2xl font-bold">لوحة تحكم الفنية</h1>

        {earnings.isLoading ? <div className="grid gap-4 md:grid-cols-3">{Array.from({ length: 3 }, (_, i) => <CardSkeleton key={i} />)}</div>
        : earnings.isError ? <ErrorAlert message="فشل التحميل" onRetry={() => earnings.refetch()} />
        : (
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="text-center"><p className="text-sm text-gray-500">الأرباح هذا الأسبوع</p><p className="text-2xl font-bold text-green-600">{formatCurrency(0)}</p></Card>
            <Card className="text-center"><p className="text-sm text-gray-500">حجوزات اليوم</p><p className="text-2xl font-bold text-brand-600">-</p></Card>
            <Card className="text-center"><p className="text-sm text-gray-500">طلبات معلقة</p><p className="text-2xl font-bold text-amber-600">{pending.data?.length ?? 0}</p></Card>
          </div>
        )}

        <h2 className="text-lg font-semibold">طلبات الحجز المعلقة</h2>
        {pending.isLoading ? <CardSkeleton />
        : pending.isError ? <ErrorAlert message="فشل تحميل الطلبات" onRetry={() => pending.refetch()} />
        : !pending.data || (pending.data as unknown[]).length === 0
          ? <EmptyState title="لا توجد طلبات معلقة" />
        : <div className="space-y-3">
            {(pending.data as Record<string, unknown>[]).map((b: Record<string, unknown>) => (
              <Card key={b.id as number} padding="md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{b.bookingCode as string}</p>
                    <p className="text-sm text-gray-500">{new Date(b.startAt as string).toLocaleDateString('ar-SA')}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => transition.mutate({ id: b.id as number, action: 'accept' })}>قبول</Button>
                    <Button size="sm" variant="danger" onClick={() => transition.mutate({ id: b.id as number, action: 'reject' })}>رفض</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        }
      </div>
    </DashboardLayout>
  );
}
