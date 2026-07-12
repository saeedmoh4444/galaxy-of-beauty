'use client';

import Link from 'next/link';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button, formatCurrency } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function CustomerDashboardPage(): JSX.Element {
  const bookings = api.bookings.list.useQuery({ limit: 5 });
  const insights = api.analytics.customerInsights.useQuery({} as never);

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-5xl space-y-6">
        <h1 className="text-2xl font-bold">لوحة التحكم</h1>

        {insights.isLoading ? <div className="grid gap-4 md:grid-cols-4">{Array.from({ length: 4 }, (_, i) => <CardSkeleton key={i} />)}</div>
        : insights.isError ? <ErrorAlert message="فشل تحميل الإحصائيات" onRetry={() => insights.refetch()} />
        : (
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="text-center"><p className="text-sm text-gray-500">إجمالي الحجوزات</p><p className="text-2xl font-bold text-brand-600">{insights.data?.bookingCount ?? 0}</p></Card>
            <Card className="text-center"><p className="text-sm text-gray-500">إجمالي الإنفاق</p><p className="text-2xl font-bold text-green-600">{formatCurrency(Number(insights.data?.totalSpent ?? 0))}</p></Card>
            <Card className="text-center"><p className="text-sm text-gray-500">التقييمات</p><p className="text-2xl font-bold text-amber-600">⭐</p></Card>
            <Card className="text-center"><p className="text-sm text-gray-500">الاستمرارية</p><p className="text-2xl font-bold text-purple-600">{(insights.data?.streakInfo as unknown as Record<string, unknown>)?.currentStreak as number ?? 0} أسابيع</p></Card>
          </div>
        )}

        <div className="flex gap-3">
          <Link href="/services"><Button>احجزي الآن</Button></Link>
          <Link href="/wishlist"><Button variant="outline">المفضلة</Button></Link>
          <Link href="/services/surprise-me"><Button variant="outline">فاجئيني</Button></Link>
        </div>

        <h2 className="text-lg font-semibold">آخر الحجوزات</h2>
        {bookings.isLoading ? <CardSkeleton />
        : bookings.isError ? <ErrorAlert message="فشل تحميل الحجوزات" onRetry={() => bookings.refetch()} />
        : !bookings.data?.bookings || (bookings.data.bookings as unknown[]).length === 0
          ? <div><EmptyState title="لا توجد حجوزات" description="لم تقم بأي حجز بعد" /><div className="text-center"><Link href="/services"><Button>تصفح الخدمات</Button></Link></div></div>
        : <div className="space-y-3">
            {(bookings.data.bookings as unknown as Record<string, unknown>[]).map((b: Record<string, unknown>) => (
              <Card key={b.id as number} padding="md" hover>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{b.bookingCode as string}</p>
                    <p className="text-sm text-gray-500">{new Date(b.startAt as string).toLocaleDateString('ar-SA')}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${b.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : b.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-brand-100 text-brand-700'}`}>{b.status as string}</span>
                </div>
              </Card>
            ))}
          </div>
        }
      </div>
    </DashboardLayout>
  );
}
