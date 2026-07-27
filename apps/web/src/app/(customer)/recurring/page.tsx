'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button, Input } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@galaxy/shared';

const FREQ_LABELS: Record<string, string> = { WEEKLY: 'أسبوعي', BIWEEKLY: 'كل أسبوعين', MONTHLY: 'شهري' };

export default function RecurringPage(): JSX.Element {
  const { addToast } = useToast();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, isLoading, isError, refetch } = api.recurringBookings.list.useQuery() as any;
  const createMut = api.recurringBookings.create.useMutation({ onSuccess: () => { refetch(); setShowAdd(false); addToast('success', 'تم إنشاء الحجز المتكرر'); } });
  const pauseMut = api.recurringBookings.pause.useMutation({ onSuccess: () => { refetch(); addToast('success', 'تم الإيقاف'); } });
  const cancelMut = api.recurringBookings.cancel.useMutation({ onSuccess: () => { refetch(); addToast('success', 'تم الإلغاء'); } });
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ serviceId: '', technicianId: '', addressId: '', frequency: 'MONTHLY', nextDate: '' });

  const bookings = (data ?? []) as Array<Record<string, any>>;

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">🔄 حجوزات متكررة</h1>
          <Button onClick={() => setShowAdd(true)}>إضافة حجز متكرر</Button>
        </div>
        {isLoading ? <CardSkeleton /> : isError ? <ErrorAlert message="فشل التحميل" onRetry={() => refetch()} /> : bookings.length === 0 ? <EmptyState title="لا توجد حجوزات متكررة" description="حددي حجز متكرر أسبوعي أو شهري لتوفير الوقت" /> : (
          <div className="space-y-3">{bookings.map((b: Record<string, any>) => (
            <Card key={b.id} padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">خدمة #{b.serviceId} · {FREQ_LABELS[b.frequency] || b.frequency}</p>
                  <p className="text-sm text-gray-500">التالي: {new Date(b.nextDate).toLocaleDateString('ar-SA')}</p>
                </div>
                <div className="flex gap-2">
                  <span className={`rounded px-2 py-0.5 text-xs ${b.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : b.status === 'PAUSED' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>{b.status === 'ACTIVE' ? 'نشط' : b.status === 'PAUSED' ? 'متوقف' : 'ملغي'}</span>
                  {b.status === 'ACTIVE' && <Button size="sm" variant="outline" onClick={() => pauseMut.mutate({ id: b.id })}>⏸</Button>}
                  {b.status !== 'CANCELLED' && <Button size="sm" variant="danger" onClick={() => cancelMut.mutate({ id: b.id })}>✕</Button>}
                </div>
              </div>
            </Card>
          ))}</div>
        )}
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowAdd(false)}>
            <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-gray-900" onClick={(e) => e.stopPropagation()}>
              <h3 className="mb-4 text-lg font-bold">حجز متكرر جديد</h3>
              <div className="space-y-3">
                <Input placeholder="معرف الخدمة" type="number" value={form.serviceId} onChange={(e) => setForm({ ...form, serviceId: e.target.value })} />
                <Input placeholder="معرف الفنية (اختياري)" type="number" value={form.technicianId} onChange={(e) => setForm({ ...form, technicianId: e.target.value })} />
                <Input placeholder="معرف العنوان" type="number" value={form.addressId} onChange={(e) => setForm({ ...form, addressId: e.target.value })} />
                <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} className="w-full rounded-lg border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-800">
                  <option value="WEEKLY">أسبوعي</option><option value="BIWEEKLY">كل أسبوعين</option><option value="MONTHLY">شهري</option>
                </select>
                <Input type="date" value={form.nextDate} onChange={(e) => setForm({ ...form, nextDate: e.target.value })} />
                <Button onClick={() => createMut.mutate({ ...form, serviceId: Number(form.serviceId), addressId: Number(form.addressId), technicianId: form.technicianId ? Number(form.technicianId) : undefined, nextDate: new Date(form.nextDate).toISOString() })} loading={createMut.isPending} className="w-full">حفظ</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
