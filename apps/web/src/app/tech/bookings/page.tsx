'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function TechBookingsPage(): JSX.Element {
  const [status, setStatus] = useState<string | undefined>(undefined);
  const { data, isLoading, isError, refetch } = api.bookings.list.useQuery({ status, page: 1, limit: 20 });
  const transition = api.bookings.transition.useMutation({ onSuccess: () => refetch() });

  const bookings = (data?.bookings as Record<string, unknown>[]) ?? [];

  return (
    <DashboardLayout role="TECHNICIAN">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold">الحجوزات</h1>
        <div className="flex flex-wrap gap-2">{['ALL', 'REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED'].map((s) => <button key={s} onClick={() => setStatus(s === 'ALL' ? undefined : s)} className={`rounded-full px-4 py-1.5 text-sm font-medium ${(s === 'ALL' && !status) || s === status ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>{s}</button>)}</div>

        {isLoading ? <CardSkeleton />
        : isError ? <ErrorAlert message="فشل تحميل الحجوزات" onRetry={() => refetch()} />
        : bookings.length === 0 ? <EmptyState title="لا توجد حجوزات" />
        : <div className="space-y-3">{bookings.map((b: Record<string, unknown>) => (
            <Card key={b.id as number} padding="md">
              <div className="flex items-center justify-between">
                <div><p className="font-semibold">{b.bookingCode as string}</p><p className="text-sm text-gray-500">{new Date(b.startAt as string).toLocaleDateString('ar-SA')}</p></div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${b.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : b.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-brand-100 text-brand-700'}`}>{b.status as string}</span>
                <div className="flex gap-1">
                  {b.status === 'REQUESTED' && <><Button size="sm" onClick={() => transition.mutate({ id: b.id as number, action: 'accept' })}>قبول</Button><Button size="sm" variant="danger" onClick={() => transition.mutate({ id: b.id as number, action: 'reject' })}>رفض</Button></>}
                  {b.status === 'ACCEPTED' && <Button size="sm" onClick={() => transition.mutate({ id: b.id as number, action: 'start' })}>بدء</Button>}
                  {b.status === 'IN_PROGRESS' && <Button size="sm" onClick={() => transition.mutate({ id: b.id as number, action: 'complete' })}>إكمال</Button>}
                </div>
              </div>
            </Card>
          ))}</div>
        }
      </div>
    </DashboardLayout>
  );
}
