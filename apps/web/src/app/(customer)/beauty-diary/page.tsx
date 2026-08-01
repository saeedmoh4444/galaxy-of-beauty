'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const MOODS = [
  { value: 5, emoji: '😍', label: 'ممتاز' },
  { value: 4, emoji: '😊', label: 'جيد' },
  { value: 3, emoji: '😐', label: 'عادي' },
  { value: 2, emoji: '😔', label: 'سيء' },
  { value: 1, emoji: '😢', label: 'مزعج' },
];

export default function BeautyDiaryPage(): JSX.Element {
  const { data: journals, isLoading } = api.beautyJournal.list.useQuery({ page: 1, limit: 20 }) as { data: Record<string,unknown> | undefined; isLoading: boolean };
  const createMut = api.beautyJournal.create.useMutation();
  const entries = (Array.isArray(journals) ? journals : (journals as Record<string,unknown>)?.items as Array<Record<string,unknown>>) ?? [];
  const [content, setContent] = useState(''); const [mood, setMood] = useState(3); const [showForm, setShowForm] = useState(false);

  const handleCreate = () => {
    if (!content.trim()) return;
    createMut.mutate({ content: content.trim(), mood }, { onSuccess: () => { setContent(''); setMood(3); setShowForm(false); } });
  };

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold">📔 يوميات الجمال</h1><p className="mt-1 text-sm text-gray-500">دوني رحلتكِ ومشاعركِ</p></div>
          <Button onClick={() => setShowForm(!showForm)}>{showForm ? '✕' : '+ يومية'}</Button>
        </div>

        {showForm && <Card padding="lg">
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="اكتبي يومياتكِ..." rows={3} className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
          <div className="flex gap-2 mt-3 justify-center">{MOODS.map(m => (
            <button key={m.value} onClick={() => setMood(m.value)} className={`rounded-full px-3 py-2 text-center transition-all ${mood===m.value?'ring-2 ring-brand-400 bg-brand-50 scale-110':''}`}><span className="text-2xl block">{m.emoji}</span><span className="text-xs">{m.label}</span></button>
          ))}</div>
          <Button onClick={handleCreate} loading={createMut.isPending} className="w-full mt-3">💾 حفظ</Button>
        </Card>}

        {isLoading ? <div className="space-y-3">{Array.from({length:3},(_,i)=><CardSkeleton key={i}/>)}</div> :
          entries.length === 0 ? <Card padding="lg" className="text-center py-8"><p className="text-4xl mb-2">📔</p><p className="text-gray-500">مافي يوميات بعد — اكتبي أول يومية لكِ</p></Card> :
          <div className="space-y-3">{entries.map((e: Record<string,unknown>) => {
            const moodEmoji = MOODS.find(m => m.value === (e.mood as number))?.emoji ?? '😐';
            return (
              <Card key={e.id as number} padding="md">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{moodEmoji}</span>
                  <div className="flex-1"><p className="text-sm">{e.content as string}</p><p className="text-xs text-gray-400 mt-1">{new Date(e.createdAt as string).toLocaleDateString('ar-SA', {day:'numeric', month:'long', hour:'2-digit', minute:'2-digit'})}</p></div>
                </div>
              </Card>
            );
          })}</div>
        }
      </div>
    </DashboardLayout>
  );
}
