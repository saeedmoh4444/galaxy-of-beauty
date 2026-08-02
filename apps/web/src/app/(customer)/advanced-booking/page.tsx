'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, Button, formatCurrency  } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const SERVICES = [
  { id: 1, name: 'مانيكير', emoji: '💅', price: 100 },
  { id: 2, name: 'باديكير', emoji: '🦶', price: 120 },
  { id: 3, name: 'تنظيف بشرة', emoji: '✨', price: 200 },
  { id: 4, name: 'مساج', emoji: '💆‍♀️', price: 250 },
  { id: 5, name: 'مكياج', emoji: '💄', price: 300 },
];

const RECURRENCE_OPTS = [
  { key: 'WEEKLY', name: 'أسبوعياً', emoji: '📅' },
  { key: 'BIWEEKLY', name: 'كل أسبوعين', emoji: '🗓️' },
  { key: 'MONTHLY', name: 'شهرياً', emoji: '📆' },
];

export default function AdvancedBookingPage(): JSX.Element {
  const [mode, setMode] = useState<'recurring' | 'bundle'>('recurring');
  const [svcId, setSvcId] = useState(1); const [technicianId] = useState(1);
  const [recurrence, setRecurrence] = useState('WEEKLY'); const [occurrences, setOccurrences] = useState(4);
  const [startDate, setStartDate] = useState(''); const [notes] = useState('');
  const [done, setDone] = useState(false);

  const recurringMut = api.advancedBooking.createRecurring.useMutation();
  const bundleMut = api.advancedBooking.createBundle.useMutation();

  const handleRecurring = () => {
    if (!startDate) return;
    const start = new Date(startDate);
    const end = new Date(start.getTime() + 3600000);
    recurringMut.mutate({
      technicianId, serviceId: svcId, addressId: 1, slotId: 1,
      startAt: start.toISOString(), endAt: end.toISOString(),
      recurrence: recurrence as 'WEEKLY', occurrences, notes: notes || undefined }, { onSuccess: () => setDone(true) });
  };

  const svc = SERVICES.find(s => s.id === svcId)!;
  const totalPrice = mode === 'recurring' ? svc.price * occurrences : SERVICES.slice(0,3).reduce((s,x) => s + x.price, 0) * 0.85;

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div><h1 className="text-2xl font-bold">📅 حجز متقدم</h1><p className="mt-1 text-sm text-gray-500">حجوزات متكررة أو باقات متعددة الخدمات</p></div>

        {done ? <Card padding="lg" className="text-center border-2 border-green-300 bg-green-50"><p className="text-3xl">✅</p><p className="font-bold text-green-700 mt-2">تم إنشاء الحجز بنجاح</p></Card> : (
          <>
            <div className="flex gap-2">
              <button onClick={() => setMode('recurring')} className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium ${mode==='recurring'?'bg-brand-600 text-white':'bg-gray-100'}`}>🔄 حجز متكرر</button>
              <button onClick={() => setMode('bundle')} className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium ${mode==='bundle'?'bg-brand-600 text-white':'bg-gray-100'}`}>📦 باقة خدمات</button>
            </div>

            {mode === 'recurring' ? (
              <Card padding="lg">
                <h3 className="font-bold mb-3">🔄 حجز متكرر</h3>
                <div className="space-y-3">
                  <select value={svcId} onChange={e => setSvcId(Number(e.target.value))} className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800">{SERVICES.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.name} — {formatCurrency(s.price)}</option>)}</select>
                  <div className="flex gap-2">{RECURRENCE_OPTS.map(r => (
                    <button key={r.key} onClick={() => setRecurrence(r.key)} className={`flex-1 rounded-lg px-3 py-2 text-sm ${recurrence===r.key?'bg-brand-600 text-white':'bg-gray-100'}`}>{r.emoji} {r.name}</button>
                  ))}</div>
                  <input type="number" value={occurrences} onChange={e => setOccurrences(Number(e.target.value))} min={2} max={12} placeholder="عدد المرات" className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
                  <p className="text-sm text-gray-500">الإجمالي: {occurrences} × {formatCurrency(svc.price)} = <span className="font-bold text-brand-600">{formatCurrency(totalPrice)}</span></p>
                </div>
                <Button onClick={handleRecurring} loading={recurringMut.isPending} className="w-full mt-3">🔄 إنشاء حجز متكرر</Button>
              </Card>
            ) : (
              <Card padding="lg">
                <h3 className="font-bold mb-3">📦 باقة خدمات (خصم ١٥٪)</h3>
                <p className="text-sm text-gray-500 mb-3">اختاري ٣ خدمات واحصلي على خصم ١٥٪</p>
                <div className="space-y-2 mb-4">{SERVICES.slice(0,3).map(s => (
                  <div key={s.id} className="flex justify-between rounded-lg border p-3"><span>{s.emoji} {s.name}</span><span>{formatCurrency(s.price)}</span></div>
                ))}</div>
                <p className="text-sm">الإجمالي بعد الخصم: <span className="font-bold text-green-600">{formatCurrency(totalPrice)}</span></p>
                <Button onClick={() => bundleMut.mutate({ technicianId, addressId: 1, services: SERVICES.slice(0,3).map(s => ({ serviceId: s.id })), startAt: new Date().toISOString() }, { onSuccess: () => setDone(true) })} loading={bundleMut.isPending} className="w-full mt-3">📦 حجز الباقة</Button>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
