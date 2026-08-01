'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const CATEGORIES: Record<string,string> = { hair: '💇‍♀️ شعر', nails: '💅 أظافر', skincare: '✨ بشرة', makeup: '💄 مكياج', body: '🧴 جسم', other: '📌 أخرى' };
const INTERVALS = [7, 14, 21, 30, 60, 90];

export default function BeautyRemindersPage(): JSX.Element {
  const { data: reminders, isLoading } = api.beautyReminders.myReminders.useQuery() as { data: Array<Record<string,unknown>> | undefined; isLoading: boolean };
  const createMut = api.beautyReminders.create.useMutation();
  const completeMut = api.beautyReminders.complete.useMutation();
  const deleteMut = api.beautyReminders.delete.useMutation();
  const [title, setTitle] = useState(''); const [cat, setCat] = useState('hair'); const [interval, setInterval] = useState(30);
  const [showForm, setShowForm] = useState(false);

  const upcoming = (reminders ?? []).filter((r: Record<string,unknown>) => new Date(r.nextDate as string) >= new Date());
  const overdue = (reminders ?? []).filter((r: Record<string,unknown>) => new Date(r.nextDate as string) < new Date());

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold">⏰ تذكيرات الجمال</h1><p className="mt-1 text-sm text-gray-500">لا تنسي مواعيد عنايتكِ</p></div>
          <Button onClick={() => setShowForm(!showForm)}>{showForm ? '✕' : '+ تذكير'}</Button>
        </div>

        {showForm && <Card padding="lg">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="اسم التذكير (مثال: تجديد المانيكير)" className="w-full rounded-lg border px-3 py-2 text-sm mb-3 dark:border-gray-700 dark:bg-gray-800" />
          <select value={cat} onChange={e => setCat(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm mb-3 dark:border-gray-700 dark:bg-gray-800">{Object.entries(CATEGORIES).map(([k,v]) => <option key={k} value={k}>{v}</option>)}</select>
          <div className="flex gap-2 mb-3 flex-wrap">{INTERVALS.map(d => <button key={d} onClick={() => setInterval(d)} className={`rounded-full px-3 py-1 text-xs ${interval===d?'bg-brand-600 text-white':'bg-gray-100'}`}>كل {d} يوم</button>)}</div>
          <Button onClick={() => { if(title.trim()) createMut.mutate({ title: title.trim(), category: cat as 'hair', intervalDays: interval }, { onSuccess: () => { setTitle(''); setShowForm(false); } }); }} loading={createMut.isPending} className="w-full">حفظ</Button>
        </Card>}

        {isLoading ? <div className="space-y-3">{Array.from({length:3},(_,i)=><CardSkeleton key={i}/>)}</div> :
          overdue.length === 0 && upcoming.length === 0 ? <Card padding="lg" className="text-center py-8"><p className="text-4xl mb-2">⏰</p><p className="text-gray-500">مافي تذكيرات — أضيفي أول تذكير</p></Card> :
          <>
            {overdue.length > 0 && <Card padding="lg"><h3 className="font-bold mb-3 text-red-600">⚠️ فات موعدها</h3>
              <div className="space-y-2">{overdue.map((r: Record<string,unknown>) => (
                <div key={r.id as number} className="flex items-center justify-between rounded-lg border p-3 border-red-200 bg-red-50">
                  <div className="flex items-center gap-3"><span className="text-2xl">{CATEGORIES[r.category as string]?.split(' ')[0]}</span><div><p className="font-bold text-sm">{r.title as string}</p><p className="text-xs text-red-500">كان الموعد {new Date(r.nextDate as string).toLocaleDateString('ar-SA')}</p></div></div>
                  <div className="flex gap-2"><Button size="sm" onClick={() => completeMut.mutate({ id: r.id as number })}>✅ تم</Button><Button size="sm" variant="ghost" onClick={() => deleteMut.mutate({ id: r.id as number })} className="text-red-500">🗑</Button></div>
                </div>
              ))}</div>
            </Card>}

            {upcoming.length > 0 && <Card padding="lg"><h3 className="font-bold mb-3">📅 قادمة</h3>
              <div className="space-y-2">{upcoming.map((r: Record<string,unknown>) => (
                <div key={r.id as number} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3"><span className="text-2xl">{CATEGORIES[r.category as string]?.split(' ')[0]}</span><div><p className="font-bold text-sm">{r.title as string}</p><p className="text-xs text-gray-500">{new Date(r.nextDate as string).toLocaleDateString('ar-SA')} · كل {r.intervalDays as number} يوم</p></div></div>
                  <Button size="sm" variant="ghost" onClick={() => deleteMut.mutate({ id: r.id as number })} className="text-red-500">🗑</Button>
                </div>
              ))}</div>
            </Card>}
          </>
        }
      </div>
    </DashboardLayout>
  );
}
