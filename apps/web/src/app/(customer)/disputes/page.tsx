'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button, Modal, Input } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const STATUS_STYLES: Record<string, string> = {
  OPEN: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  UNDER_REVIEW: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  RESOLVED_CUSTOMER: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  RESOLVED_TECHNICIAN: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  CLOSED: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'مفتوحة',
  UNDER_REVIEW: 'قيد المراجعة',
  RESOLVED_CUSTOMER: 'تم الحل لصالحك',
  RESOLVED_TECHNICIAN: 'تم الحل لصالح الفني',
  CLOSED: 'مغلقة',
};

export default function DisputesPage(): JSX.Element {
  const [showCreate, setShowCreate] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [reason, setReason] = useState('');

  const { data, isLoading, isError, refetch } = api.disputes.list.useQuery({} as never);
  const createMut = api.disputes.create.useMutation({
    onSuccess: () => {
      setShowCreate(false);
      setBookingId('');
      setReason('');
      refetch();
    },
  });

  const disputes = (data as unknown as Record<string, unknown>[]) ?? [];

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">النزاعات</h1>
          <Button onClick={() => setShowCreate(true)}>فتح نزاع جديد</Button>
        </div>

        {isLoading ? (
          <CardSkeleton />
        ) : isError ? (
          <ErrorAlert message="فشل تحميل النزاعات" onRetry={() => refetch()} />
        ) : disputes.length === 0 ? (
          <div>
            <EmptyState title="لا توجد نزاعات" description="لم تقم بفتح أي نزاع حتى الآن" />
            <div className="text-center">
              <Button onClick={() => setShowCreate(true)}>فتح نزاع</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {disputes.map((d: Record<string, unknown>) => {
              const statusKey = d.status as string;
              return (
                <Card key={d.id as number} padding="md">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{d.bookingCode as string ?? `حجز #${d.bookingId as string}`}</p>
                        <p className="text-xs text-gray-400">{new Date(d.createdAt as string).toLocaleDateString('ar-SA')}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[statusKey] ?? 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABELS[statusKey] ?? statusKey}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{d.reason as string}</p>
                    {(d.resolution as string) && (
                      <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                        <p className="text-xs font-medium text-gray-500">قرار الإدارة</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{d.resolution as string}</p>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="فتح نزاع جديد" size="sm">
        <div className="space-y-4">
          <Input label="رقم الحجز" value={bookingId} onChange={(e) => setBookingId(e.target.value)} placeholder="أدخل رقم الحجز" />
          <div>
            <label className="mb-1 block text-sm font-medium">سبب النزاع</label>
            <textarea
              className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="اشرح سبب النزاع بالتفصيل..."
            />
          </div>
          <Button className="w-full" loading={createMut.isPending} disabled={!bookingId || !reason} onClick={() => createMut.mutate({ bookingId: Number(bookingId), reason })}>
            إرسال النزاع
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
