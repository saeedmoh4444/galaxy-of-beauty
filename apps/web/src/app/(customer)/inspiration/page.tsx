/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button, Input } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@galaxy/shared';

export default function InspirationPage(): JSX.Element {
  const { addToast } = useToast();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, isLoading, isError, refetch } = api.inspiration.list.useQuery() as any;
  const createMut = api.inspiration.create.useMutation({ onSuccess: () => { refetch(); setShowAdd(false); setForm({ imageUrl: '', title: '', notes: '', tags: '' }); addToast('success', 'تمت الإضافة'); } });
  const deleteMut = api.inspiration.delete.useMutation({ onSuccess: () => { refetch(); addToast('success', 'تم الحذف'); } });
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ imageUrl: '', title: '', notes: '', tags: '' });

  const pins = (data ?? []) as Array<Record<string, any>>;

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">📌 لوحة الإلهام</h1>
          <Button onClick={() => setShowAdd(true)}>إضافة إلهام</Button>
        </div>
        {isLoading ? <div className="grid gap-4 sm:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} />)}</div>
        : isError ? <ErrorAlert message="فشل التحميل" onRetry={() => refetch()} />
        : pins.length === 0 ? <EmptyState title="لا توجد دبابيس" description="احفظي الصور والأفكار اللي تعجبكِ لموعدكِ القادم" />
        : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{(pins as Array<Record<string, any>>).map((p: Record<string, any>) => (
          <Card key={p.id} padding="md" className="relative group">
            {p.imageUrl ? <img src={p.imageUrl} alt={p.title || ''} className="mb-3 h-40 w-full rounded-xl object-cover" /> : <div className="mb-3 flex h-40 items-center justify-center rounded-xl bg-gray-100 text-4xl dark:bg-gray-800">✨</div>}
            {p.title && <h3 className="font-semibold text-gray-900 dark:text-gray-100">{p.title}</h3>}
            {p.notes && <p className="mt-1 text-sm text-gray-500 line-clamp-2">{p.notes}</p>}
            {p.tags?.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{(p.tags as string[]).map((t: string) => <span key={t} className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-600">{t}</span>)}</div>}
            <button onClick={() => deleteMut.mutate({ id: p.id })} className="absolute top-2 right-2 hidden rounded-full bg-red-500 p-1 text-white group-hover:block">✕</button>
          </Card>
        ))}</div>}
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowAdd(false)}>
            <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-gray-900" onClick={(e) => e.stopPropagation()}>
              <h3 className="mb-4 text-lg font-bold">إضافة إلهام جديد</h3>
              <div className="space-y-3">
                <Input placeholder="رابط الصورة" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
                <Input placeholder="العنوان" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <Input placeholder="ملاحظات" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                <Input placeholder="وسوم (مفصولة بفواصل)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
                <Button onClick={() => createMut.mutate({ ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) })} loading={createMut.isPending} className="w-full">حفظ</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
