'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button, Modal } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function ExpiryTrackerPage(): JSX.Element {
  const { data: cats } = api.expiryTracker.categories.useQuery() as { data: Array<Record<string,unknown>> | undefined };
  const { data: items, isLoading, isError, refetch } = api.expiryTracker.myItems.useQuery() as { data: Array<Record<string,unknown>> | undefined; isLoading: boolean; isError: boolean; refetch: () => void };
  const addMut = api.expiryTracker.add.useMutation({ onSuccess: () => { setShowAdd(false); refetch(); } });
  const deleteMut = api.expiryTracker.delete.useMutation({ onSuccess: () => refetch() });

  const [showAdd, setShowAdd] = useState(false); const [name, setName] = useState(''); const [cat, setCat] = useState('mascara');
  const categories = (cats ?? []) as Array<Record<string,unknown>>;
  const myItems = (items ?? []) as Array<Record<string,unknown>>;

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">⏱️ متعقب الصلاحية</h1><p className="mt-1 text-sm text-gray-500">تتبعي تاريخ فتح منتجاتكِ وتجنبي استخدام المنتجات منتهية الصلاحية</p></div><Button onClick={() => setShowAdd(true)}>+ منتج</Button></div>

        {isLoading ? <div className="space-y-3">{Array.from({length:3},(_,i)=><CardSkeleton key={i}/>)}</div>
        : isError ? <ErrorAlert message="فشل التحميل" onRetry={()=>refetch()} />
        : myItems.length === 0 ? <EmptyState title="لا توجد منتجات" description="أضيفي منتجاتكِ لتتبع تواريخ صلاحيتها" action={{label:'إضافة',onPress:()=>setShowAdd(true)}} />
        : <div className="space-y-3">{myItems.map((i:Record<string,unknown>) => (
            <Card key={i.id as number} padding="md" className={(i.expired as boolean) ? 'border-2 border-red-300 dark:border-red-700 opacity-70' : (i.isClose as boolean) ? 'border-2 border-amber-300 dark:border-amber-700' : ''}>
              <div className="flex items-center gap-4"><span className="text-3xl">{i.emoji as string}</span><div className="flex-1"><h3 className="font-bold">{i.productName as string}</h3><p className="text-xs text-gray-500 mt-0.5">فتح: {new Date(i.openDate as string).toLocaleDateString('ar-SA')} · ينتهي بعد {(i.expiryMonths as number)} شهر</p></div>
                <div className="text-right">{(i.expired as boolean) ? <span className="rounded-full bg-red-100 dark:bg-red-900 px-2.5 py-0.5 text-xs font-bold text-red-700">منتهي</span> : ((i.isClose as boolean) ? <span className="rounded-full bg-amber-100 dark:bg-amber-900 px-2.5 py-0.5 text-xs font-bold text-amber-700">{(i.daysLeft as number)} يوم</span> : <span className="text-sm text-green-600 font-bold">{(i.daysLeft as number)} يوم</span>)}
                <button onClick={()=>deleteMut.mutate({id:i.id as number})} className="block mt-1 text-xs text-red-400">🗑️</button></div>
              </div>
            </Card>
          ))}</div>
        }

        <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="إضافة منتج"><div className="space-y-3">
          <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="اسم المنتج" className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
          <select value={cat} onChange={(e)=>setCat(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800">{categories.map((c:Record<string,unknown>)=><option key={c.key as string} value={c.key as string}>{c.emoji as string} {c.nameAr as string} ({c.months as number} شهر)</option>)}</select>
          <Button onClick={()=>{if(name.trim())addMut.mutate({productName:name.trim(),category:cat});}} loading={addMut.isPending} className="w-full">⏱️ إضافة</Button>
        </div></Modal>
      </div>
    </DashboardLayout>
  );
}
