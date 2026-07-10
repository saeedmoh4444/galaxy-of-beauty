'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button, Input } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function TechSlotsPage(): JSX.Element {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0] ?? '');
  const { data, isLoading, isError, refetch } = api.slots.getMySlots.useQuery({ startDate: date, endDate: date });
  const createMut = api.slots.createSlots.useMutation({ onSuccess: () => refetch() });
  const deleteMut = api.slots.deleteSlot.useMutation({ onSuccess: () => refetch() });
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');

  const slots = (data as unknown as Record<string, unknown>[]) ?? [];
  const next7Days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return d.toISOString().split('T')[0] ?? ''; });

  return (
    <DashboardLayout role="TECHNICIAN">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold">المواعيد المتاحة</h1>

        <div className="flex flex-wrap gap-2">{next7Days.map((d) => <button key={d} onClick={() => setDate(d)} className={`rounded-lg px-4 py-2 text-sm font-medium ${d === date ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>{d}</button>)}</div>

        <Card>
          <h2 className="mb-3 font-semibold">إضافة موعد</h2>
          <div className="flex gap-3"><Input label="من" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} /><Input label="إلى" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} /><Button onClick={() => createMut.mutate({ slots: [{ startAt: new Date(`${date}T${startTime}:00`).toISOString(), endAt: new Date(`${date}T${endTime}:00`).toISOString() }] })} loading={createMut.isPending} className="self-end">+ إضافة</Button></div>
        </Card>

        <h2 className="text-lg font-semibold">مواعيد {date}</h2>
        {isLoading ? <CardSkeleton />
        : isError ? <ErrorAlert message="فشل تحميل المواعيد" onRetry={() => refetch()} />
        : slots.length === 0 ? <EmptyState title="لا توجد مواعيد" description="أضف مواعيداً متاحة لهذا اليوم" />
        : <div className="space-y-2">{slots.map((s: Record<string, unknown>) => (
            <Card key={s.id as number} padding="sm"><div className="flex items-center justify-between"><span>{new Date(s.startAt as string).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })} - {new Date(s.endAt as string).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span><span className={`text-xs ${s.isBooked ? 'text-red-500' : 'text-green-500'}`}>{s.isBooked ? 'محجوز' : 'متاح'}</span>{!s.isBooked && <Button size="sm" variant="ghost" onClick={() => deleteMut.mutate({ slotId: s.id as number })}>حذف</Button>}</div></Card>
          ))}</div>
        }
      </div>
    </DashboardLayout>
  );
}
