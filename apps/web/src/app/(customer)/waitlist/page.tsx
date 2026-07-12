'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button, Modal, Input } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const STATUS_STYLES: Record<string, string> = {
  WAITING: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  NOTIFIED: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  CLAIMED: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  EXPIRED: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const STATUS_LABELS: Record<string, string> = {
  WAITING: 'بانتظار الدور',
  NOTIFIED: 'تم الإشعار',
  CLAIMED: 'تم الحجز',
  EXPIRED: 'منتهي',
};

export default function WaitlistPage(): JSX.Element {
  const [showJoin, setShowJoin] = useState(false);
  const [selectedTechId, setSelectedTechId] = useState('');
  const [serviceName, setServiceName] = useState('');

  const { data, isLoading, isError, refetch } = api.waitlist.listMyEntries.useQuery({} as never);
  const techsQuery = api.technicians.list.useQuery({ limit: 100 });
  const joinMut = api.waitlist.join.useMutation({
    onSuccess: () => {
      setShowJoin(false);
      setSelectedTechId('');
      setServiceName('');
      refetch();
    },
  });
  const leaveMut = api.waitlist.leave.useMutation({ onSuccess: () => refetch() });

  const entries = (data as unknown as Record<string, unknown>[]) ?? [];
  const technicians = ((techsQuery.data as unknown as Record<string, unknown>[]) ?? []) as unknown as Record<string, unknown>[];

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">قائمة الانتظار</h1>
          <Button onClick={() => setShowJoin(true)}>انضمام للقائمة</Button>
        </div>

        {isLoading ? (
          <CardSkeleton />
        ) : isError ? (
          <ErrorAlert message="فشل تحميل قائمة الانتظار" onRetry={() => refetch()} />
        ) : entries.length === 0 ? (
          <div>
            <EmptyState title="قائمة الانتظار فارغة" description="لم تنضم لأي قائمة انتظار بعد" />
            <div className="text-center">
              <Button onClick={() => setShowJoin(true)}>انضمام الآن</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((e: Record<string, unknown>) => {
              const statusKey = e.status as string;
              return (
                <Card key={e.id as number} padding="md">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-semibold">{e.technicianName as string ?? 'فني'}</p>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span>الترتيب: <strong className="text-brand-600">#{e.position as number}</strong></span>
                        {(e.serviceName as string | null) ? <span>الخدمة: {e.serviceName as string}</span> : null}
                      </div>
                      <p className="text-xs text-gray-400">{new Date(e.createdAt as string).toLocaleDateString('ar-SA')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[statusKey] ?? 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABELS[statusKey] ?? statusKey}
                      </span>
                      {statusKey === 'WAITING' && (
                        <Button size="sm" variant="danger" onClick={() => leaveMut.mutate({ technicianId: e.technicianId as number })} loading={leaveMut.isPending}>
                          مغادرة
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Modal open={showJoin} onClose={() => setShowJoin(false)} title="انضمام لقائمة الانتظار" size="sm">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">اختر الفني</label>
            <select
              className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800"
              value={selectedTechId}
              onChange={(e) => setSelectedTechId(e.target.value)}
            >
              <option value="">-- اختر فني --</option>
              {technicians.map((t: Record<string, unknown>) => (
                <option key={t.id as number} value={t.id as number}>{t.name as string}</option>
              ))}
            </select>
          </div>
          <Input label="الخدمة (اختياري)" value={serviceName} onChange={(e) => setServiceName(e.target.value)} placeholder="اسم الخدمة إن وجد" />
          <Button className="w-full" loading={joinMut.isPending} disabled={!selectedTechId} onClick={() => joinMut.mutate({ technicianId: Number(selectedTechId) })}>
            تأكيد الانضمام
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
