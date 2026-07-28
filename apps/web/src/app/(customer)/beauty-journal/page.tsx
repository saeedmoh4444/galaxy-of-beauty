'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@galaxy/shared';

const MOODS = ['😔', '😐', '🙂', '😊', '😍'];
const SERVICE_TYPES = ['hair', 'skin', 'makeup', 'nails', 'body'] as const;
const TYPE_LABELS: Record<string, string> = { hair: '💇‍♀️ شعر', skin: '✨ بشرة', makeup: '💄 مكياج', nails: '💅 أظافر', body: '🧴 جسم' };

export default function BeautyJournalPage(): JSX.Element {
  const { addToast } = useToast();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, isLoading, isError, refetch } = (api as any).beautyJournal.list.useQuery({ page: 1, limit: 20 }) as any;
  const createMut = (api as any).beautyJournal.create.useMutation({ onSuccess: () => { refetch(); setContent(''); setTitle(''); setMood(0); setServiceType(''); addToast('success', 'تمت الإضافة لليوميات'); } });
  const deleteMut = (api as any).beautyJournal.delete.useMutation({ onSuccess: () => { refetch(); addToast('success', 'تم الحذف'); } });
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [mood, setMood] = useState(0);
  const [serviceType, setServiceType] = useState('');

  const entries = (data ?? []) as Array<Record<string, any>>;

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">📓 يوميات الجمال</h1>
        <p className="text-sm text-gray-500">دوّني رحلتكِ الجمالية — تجارب، مشاعر، وإطلالات</p>

        {/* New Entry */}
        <Card padding="lg">
          <div className="space-y-3">
            <input placeholder="عنوان (اختياري)" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-800" />
            <textarea placeholder="اكتبي يومياتكِ..." value={content} onChange={(e) => setContent(e.target.value)} rows={3} className="w-full rounded-lg border border-gray-300 p-3 text-sm dark:border-gray-600 dark:bg-gray-800" />
            <div className="flex gap-4 flex-wrap">
              <div className="flex gap-1">{MOODS.map((m, i) => <button key={i} onClick={() => setMood(i + 1)} className={`text-xl transition-all ${mood === i + 1 ? 'scale-125' : 'opacity-40 hover:opacity-70'}`}>{m}</button>)}</div>
              <select value={serviceType} onChange={(e) => setServiceType(e.target.value)} className="rounded-lg border border-gray-300 p-2 text-xs dark:border-gray-600 dark:bg-gray-800"><option value="">نوع الخدمة</option>{SERVICE_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}</select>
            </div>
            <Button onClick={() => { if (content.trim()) createMut.mutate({ title: title || undefined, content: content.trim(), mood: mood || undefined, serviceType: serviceType || undefined }); }} className="w-full" size="sm">✍️ تدوين</Button>
          </div>
        </Card>

        {/* Entries */}
        {isLoading ? <div className="space-y-4">{Array.from({ length: 3 }, (_, i) => <CardSkeleton key={i} />)}</div>
        : isError ? <ErrorAlert message="فشل التحميل" onRetry={() => refetch()} />
        : entries.length === 0 ? <EmptyState title="لا توجد يوميات" description="ابدئي بتدوين أول تجربة جمالية" />
        : <div className="space-y-4">{entries.map((e: Record<string, any>) => (
          <Card key={e.id} padding="md" className="relative group">
            <button onClick={() => deleteMut.mutate({ id: e.id })} className="absolute top-2 right-2 hidden rounded-full bg-red-500 p-1 text-white text-xs group-hover:block">✕</button>
            <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
              {e.mood && <span>{MOODS[e.mood - 1]}</span>}
              {e.serviceType && <span className="rounded-full bg-brand-50 px-2 py-0.5 text-brand-600">{TYPE_LABELS[e.serviceType]}</span>}
              <span>{new Date(e.createdAt).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}</span>
            </div>
            {e.title && <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{e.title}</h3>}
            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{e.content}</p>
          </Card>
        ))}</div>}
      </div>
    </DashboardLayout>
  );
}
