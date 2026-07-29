'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button, Modal } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function RestockReminderPage(): JSX.Element {
  const { data: cats } = api.restockReminder.categories.useQuery() as { data: Array<Record<string,unknown>> | undefined };
  const { data: items, isLoading, isError, refetch } = api.restockReminder.myItems.useQuery() as {
    data: Array<Record<string,unknown>> | undefined; isLoading: boolean; isError: boolean; refetch: () => void;
  };
  const addMut = api.restockReminder.add.useMutation({ onSuccess: () => { setShowAdd(false); refetch(); } });
  const deleteMut = api.restockReminder.delete.useMutation({ onSuccess: () => refetch() });

  const [showAdd, setShowAdd] = useState(false);
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('moisturizer');

  const categories = (cats ?? []) as Array<Record<string,unknown>>;
  const myItems = (items ?? []) as Array<Record<string,unknown>>;

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold">📦 تجديد المنتجات</h1><p className="mt-1 text-sm text-gray-500">تتبعي منتجاتكِ واحصلي على تنبيهات لإعادة الشراء</p></div>
          <Button onClick={() => setShowAdd(true)}>+ منتج</Button>
        </div>

        {isLoading ? <div className="space-y-3">{Array.from({length:3},(_,i)=><CardSkeleton key={i}/>)}</div>
        : isError ? <ErrorAlert message="فشل التحميل" onRetry={()=>refetch()} />
        : myItems.length === 0 ? <EmptyState title="لا توجد منتجات" description="أضيفي منتجاتكِ لبدء تتبعها" action={{ label: 'إضافة منتج', onPress: () => setShowAdd(true) }} />
        : <div className="space-y-3">
            {myItems.map((item: Record<string,unknown>) => {
              const daysLeft = (item.daysLeft as number) ?? 0;
              const needsRestock = item.needsRestock as boolean;
              const pct = Math.min(100, Math.round((daysLeft / ((item.lifespanDays as number) || 60)) * 100));
              return (
                <Card key={item.id as number} padding="md" className={needsRestock ? 'border-2 border-red-300 dark:border-red-700' : ''}>
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{item.emoji as string}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between"><h3 className="font-bold">{item.productName as string}</h3>{needsRestock && <span className="rounded-full bg-red-100 dark:bg-red-900 px-2 py-0.5 text-xs font-bold text-red-700 dark:text-red-300">⏰ حان وقت التجديد</span>}</div>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden"><div className={`h-full rounded-full ${needsRestock ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${pct}%` }} /></div>
                        <span className="text-xs text-gray-500">{daysLeft} يوم متبقي</span>
                      </div>
                    </div>
                    <button onClick={() => deleteMut.mutate({ id: item.id as number })} className="text-gray-400 hover:text-red-500">🗑️</button>
                  </div>
                </Card>
              );
            })}
          </div>
        }

        <Modal open={showAdd} onClose={() => setShowAdd(false)} title="إضافة منتج">
          <div className="space-y-3">
            <div><label className="text-sm font-semibold">اسم المنتج</label><input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 mt-1" /></div>
            <div><label className="text-sm font-semibold">الفئة</label><select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 mt-1">{categories.map((c: Record<string,unknown>) => <option key={c.key as string} value={c.key as string}>{c.emoji as string} {c.nameAr as string}</option>)}</select></div>
            <Button onClick={() => { if (productName.trim()) addMut.mutate({ productName: productName.trim(), category }); }} loading={addMut.isPending} className="w-full">📦 إضافة</Button>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
