'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button, Modal } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const STATUS_TABS = ['ALL', 'REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export default function BookingsPage(): JSX.Element {
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [cancelId, setCancelId] = useState<number | null>(null);
  const { data, isLoading, isError, refetch } = api.bookings.list.useQuery({ status, page, limit: 10 });
  const cancelMut = api.bookings.transition.useMutation({ onSuccess: () => { setCancelId(null); refetch(); } });

  const bookings = (data?.bookings as unknown as Record<string, unknown>[]) ?? [];

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold">حجوزاتي</h1>
        <div className="flex flex-wrap gap-2">{STATUS_TABS.map((s) => <button key={s} onClick={() => { setStatus(s === 'ALL' ? undefined : s); setPage(1); }} className={`rounded-full px-4 py-1.5 text-sm font-medium ${(s === 'ALL' && !status) || s === status ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>{s === 'ALL' ? 'الكل' : s}</button>)}</div>

        {isLoading ? <CardSkeleton />
        : isError ? <ErrorAlert message="فشل تحميل الحجوزات" onRetry={() => refetch()} />
        : bookings.length === 0 ? <div><EmptyState title="لا توجد حجوزات" /><div className="text-center"><Link href="/services"><Button>تصفح الخدمات</Button></Link></div></div>
        : <div className="space-y-3">{bookings.map((b: Record<string, unknown>) => (
            <Card key={b.id as number} padding="md">
              <div className="flex items-center justify-between">
                <div><p className="font-semibold">{b.bookingCode as string}</p><p className="text-sm text-gray-500">{new Date(b.startAt as string).toLocaleDateString('ar-SA')}</p></div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                  b.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : b.status === 'CANCELLED' || b.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-brand-100 text-brand-700'}`}>{b.status as string}</span>
                {(b.status === 'REQUESTED' || b.status === 'ACCEPTED') && <Button size="sm" variant="danger" onClick={() => setCancelId(b.id as number)}>إلغاء</Button>}
                {(b.status === 'PAID' || b.status === 'IN_PROGRESS') && (
                  <Link href={`/customer/video/${b.id}`} className="rounded-lg bg-purple-600 px-3 py-1 text-xs font-medium text-white hover:bg-purple-700">📹 فيديو</Link>
                )}
              </div>
            </Card>
          ))}</div>
        }
      </div>
      <Modal open={cancelId !== null} onClose={() => setCancelId(null)} title="تأكيد الإلغاء" size="sm">
        <p className="text-sm text-gray-600 dark:text-gray-400">هل أنت متأكد من إلغاء هذا الحجز؟</p>
        <div className="mt-4 flex gap-3"><Button variant="outline" onClick={() => setCancelId(null)} className="flex-1">رجوع</Button><Button variant="danger" onClick={() => cancelId && cancelMut.mutate({ id: cancelId, action: 'cancel' })} loading={cancelMut.isPending} className="flex-1">تأكيد الإلغاء</Button></div>
      </Modal>
    </DashboardLayout>
  );
}
