'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import type { RouterOutput } from '@galaxy/api/client';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button, formatCurrency } from '@galaxy/shared';

const STATUSES = ['ALL', 'REQUESTED', 'ACCEPTED', 'PAID', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

type BookingItem = NonNullable<RouterOutput['admin']['getAllBookings']>['items'][number];

export default function AdminBookingsPage(): JSX.Element {
  const [status, setStatus] = useState<string | undefined>(undefined);
  const { data, isLoading, isError, refetch } = api.admin.getAllBookings.useQuery({
    status: (status as BookingItem['status']) || undefined,
    page: 1,
    limit: 20,
  });
  const cancelMut = api.bookings.transition.useMutation({ onSuccess: () => refetch() });

  const bookings = data?.items ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">جميع الحجوزات</h1>
      <div className="flex flex-wrap gap-2">{STATUSES.map((s) => <button key={s} onClick={() => setStatus(s === 'ALL' ? undefined : s)} className={`rounded-full px-4 py-1.5 text-sm font-medium ${(s === 'ALL' && !status) || s === status ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>{s}</button>)}</div>

      {isLoading ? <CardSkeleton />
      : isError ? <ErrorAlert message="فشل تحميل الحجوزات" onRetry={() => refetch()} />
      : bookings.length === 0 ? <EmptyState title="لا توجد حجوزات" />
      : <div className="space-y-2">{bookings.map((b: BookingItem) => (
          <Card key={b.id} padding="md">
            <div className="flex items-center justify-between">
              <div><p className="font-semibold">{b.bookingCode}</p><p className="text-sm text-gray-500">{new Date(b.createdAt).toLocaleDateString('ar-SA')}</p></div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${b.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : b.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-brand-100 text-brand-700'}`}>{b.status}</span>
              <p className="font-semibold">{formatCurrency(Number(b.totalAmount ?? 0))}</p>
              {b.status !== 'COMPLETED' && b.status !== 'CANCELLED' && <Button size="sm" variant="danger" onClick={() => cancelMut.mutate({ id: b.id, action: 'cancel' })}>إلغاء</Button>}
            </div>
          </Card>
        ))}</div>
      }
    </div>
  );
}
