'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button, Input, Modal } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@galaxy/shared';

export default function SavedCardsPage(): JSX.Element {
  const { addToast } = useToast();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, isLoading, isError, refetch } = (api.savedCards as any).list.useQuery();
  const cards = (data as Array<Record<string, unknown>>) || [];

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ lastFour: '', brand: 'visa', expMonth: '1', expYear: '2026', cardholderName: '' });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addMut = (api.savedCards as any).add.useMutation({
    onSuccess: () => { setShowAdd(false); refetch(); addToast('success', 'تمت إضافة البطاقة'); },
    onError: () => addToast('error', 'فشلت إضافة البطاقة'),
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deleteMut = (api.savedCards as any).delete.useMutation({
    onSuccess: () => { refetch(); addToast('success', 'تم حذف البطاقة'); },
  });

  const brandIcons: Record<string, string> = { visa: '💳', mastercard: '💳', mada: '🏦', amex: '💳' };

  const handleAdd = () => {
    addMut.mutate({
      cardToken: `tok_${Date.now()}`,
      lastFour: form.lastFour,
      brand: form.brand,
      expMonth: Number(form.expMonth),
      expYear: Number(form.expYear),
      cardholderName: form.cardholderName,
      setDefault: cards.length === 0,
    });
  };

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">البطاقات المحفوظة</h1>
          <Button onClick={() => setShowAdd(true)}>إضافة بطاقة</Button>
        </div>

        {isLoading ? (
          Array.from({ length: 2 }, (_, i) => <CardSkeleton key={i} />)
        ) : isError ? (
          <ErrorAlert message="فشل تحميل البطاقات" onRetry={() => refetch()} />
        ) : cards.length === 0 ? (
          <EmptyState title="لا توجد بطاقات محفوظة" description="أضف بطاقة دفع لتسريع عملية الحجز" />
        ) : (
          cards.map((c) => (
            <Card key={c.id as number} padding="md" className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-2xl">{brandIcons[c.brand as string] || '💳'}</span>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {String(c.brand).toUpperCase()} ···· {String(c.lastFour)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {c.cardholderName as string} · {c.expMonth as number}/{c.expYear as number}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {c.isDefault ? <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900 dark:text-green-300">افتراضي</span> : null}
                <Button variant="outline" size="sm" onClick={() => deleteMut.mutate({ cardId: c.id })}>
                  حذف
                </Button>
              </div>
            </Card>
          ))
        )}

        {showAdd && (
          <Modal open={showAdd} onClose={() => setShowAdd(false)}>
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">إضافة بطاقة جديدة</h3>
              <Input label="الاسم على البطاقة" value={form.cardholderName} onChange={(e) => setForm({ ...form, cardholderName: e.target.value })} />
              <Input label="آخر 4 أرقام" value={form.lastFour} onChange={(e) => setForm({ ...form, lastFour: e.target.value })} maxLength={4} />
              <div className="flex gap-3">
                <select className="flex-1 rounded-lg border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-800" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}>
                  <option value="visa">Visa</option>
                  <option value="mastercard">Mastercard</option>
                  <option value="mada">Mada</option>
                  <option value="amex">Amex</option>
                </select>
                <select className="w-20 rounded-lg border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-800" value={form.expMonth} onChange={(e) => setForm({ ...form, expMonth: e.target.value })}>
                  {Array.from({ length: 12 }, (_, i) => <option key={i+1} value={i+1}>{String(i+1).padStart(2,'0')}</option>)}
                </select>
                <select className="w-24 rounded-lg border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-800" value={form.expYear} onChange={(e) => setForm({ ...form, expYear: e.target.value })}>
                  {Array.from({ length: 15 }, (_, i) => <option key={2026+i} value={2026+i}>{2026+i}</option>)}
                </select>
              </div>
              <Button onClick={handleAdd} loading={addMut.isPending} className="w-full">حفظ البطاقة</Button>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
}
