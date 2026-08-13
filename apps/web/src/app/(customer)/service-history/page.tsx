/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { api } from '@/lib/trpc';
import Link from 'next/link';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button, formatCurrency, ar } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function ServiceHistoryPage(): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, isLoading, isError, refetch } = api.bookings.list.useQuery({ limit: 50 }) as any;
  const bookings = (data?.bookings ?? []) as Array<Record<string, any>>;

  // Group by service for reorder suggestions
  const serviceCounts: Record<
    number,
    { count: number; lastDate: string; title: string; price: number }
  > = {};
  bookings
    .filter((b: any) => b.status === 'COMPLETED')
    .forEach((b: any) => {
      const sid = b.serviceId;
      if (!serviceCounts[sid]) {
        serviceCounts[sid] = {
          count: 0,
          lastDate: b.createdAt,
          title: ar((b.service as any)?.titleJson) || `خدمة #${sid}`,
          price: Number(b.totalAmount),
        };
      }
      serviceCounts[sid]!.count++;
      if (b.createdAt > serviceCounts[sid]!.lastDate) serviceCounts[sid]!.lastDate = b.createdAt;
    });

  const favorites = Object.entries(serviceCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 6);

  const recentBookings = [...bookings].sort(
    (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-8">
        <h1 className="text-2xl font-bold text-text-primary dark:text-gray-100"> سجل الخدمات</h1>

        {/* Favorite Services — Reorder */}
        {favorites.length > 0 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold"> خدماتكِ المفضلة</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {favorites.map(([sid, info]) => (
                <Card key={sid} padding="md" hover>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{info.title}</p>
                      <p className="text-xs text-text-secondary">
                        تم الحجز {info.count} مرات · آخر مرة{' '}
                        {new Date(info.lastDate).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                    <Link href={`/bookings/create?serviceId=${sid}`}>
                      <Button size="sm">أعد الحجز</Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div>
          <h2 className="mb-4 text-lg font-semibold"> آخر الحجوزات</h2>
          {isLoading ? (
            <CardSkeleton />
          ) : isError ? (
            <ErrorAlert message="فشل التحميل" onRetry={() => refetch()} />
          ) : recentBookings.length === 0 ? (
            <EmptyState title="لا توجد حجوزات سابقة" />
          ) : (
            <div className="space-y-3">
              {recentBookings.slice(0, 15).map((b: Record<string, any>, i: number) => (
                <Card key={b.id || i} padding="sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-2 w-2 rounded-full ${b.status === 'COMPLETED' ? 'bg-green-500' : b.status === 'CANCELLED' ? 'bg-red-500' : 'bg-brand-500'}`}
                      />
                      <div>
                        <p className="font-semibold text-sm">{b.bookingCode || `#${b.id}`}</p>
                        <p className="text-xs text-text-secondary">
                          {new Date(b.createdAt).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-brand-600">
                        {formatCurrency(Number(b.totalAmount || 0))}
                      </span>
                      {b.status === 'COMPLETED' && (
                        <Link href={`/bookings/create?serviceId=${b.serviceId}`}>
                          <Button size="sm" variant="outline">إعادة حجز</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
