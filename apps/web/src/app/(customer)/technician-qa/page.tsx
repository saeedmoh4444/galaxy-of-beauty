'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function TechnicianQAPage(): JSX.Element {
  const { data: categories } = api.technicianQA.categories.useQuery() as { data: Array<Record<string,unknown>> | undefined };
  const [category, setCategory] = useState('all');
  const { data: qaData, isLoading } = api.technicianQA.list.useQuery({ category: category === 'all' ? undefined : category, page: 1, limit: 20 }) as { data: Record<string,unknown> | undefined; isLoading: boolean };
  const askMut = api.technicianQA.ask.useMutation();
  const [question, setQuestion] = useState(''); const [qCat, setQCat] = useState('general'); const [showAsk, setShowAsk] = useState(false);
  const items = (qaData?.items as Array<Record<string,unknown>>) ?? [];

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold">💬 اسألي الفنيات</h1><p className="mt-1 text-sm text-gray-500">اسألي خبراء التجميل المعتمدين</p></div>
          <Button onClick={() => setShowAsk(!showAsk)}>{showAsk ? '✕' : '❓ اسألي'}</Button>
        </div>

        {showAsk && <Card padding="lg">
          <textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder="اكتبي سؤالكِ..." rows={3} className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
          <div className="flex gap-2 mt-3 flex-wrap">{(categories??[]).map((c: Record<string,unknown>) => (
            <button key={c.key as string} onClick={() => setQCat(c.key as string)} className={`rounded-full px-3 py-1 text-xs ${qCat===c.key?'bg-brand-600 text-white':'bg-gray-100'}`}>{c.emoji as string} {c.nameAr as string}</button>
          ))}</div>
          <Button onClick={() => { if(question.trim()) askMut.mutate({ question: question.trim(), category: qCat as 'general' }, { onSuccess: () => { setQuestion(''); setShowAsk(false); } }); }} loading={askMut.isPending} className="w-full mt-3">📤 أرسلي السؤال</Button>
        </Card>}

        <Card padding="lg">
          <div className="flex gap-2 mb-4 flex-wrap">
            <button onClick={() => setCategory('all')} className={`rounded-full px-3 py-1 text-xs ${category==='all'?'bg-brand-600 text-white':'bg-gray-100'}`}>الكل</button>
            {(categories??[]).map((c: Record<string,unknown>) => (
              <button key={c.key as string} onClick={() => setCategory(c.key as string)} className={`rounded-full px-3 py-1 text-xs ${category===c.key?'bg-brand-600 text-white':'bg-gray-100'}`}>{c.emoji as string} {c.nameAr as string}</button>
            ))}</div>

          {isLoading ? <div className="space-y-3">{Array.from({length:3},(_,i)=><CardSkeleton key={i}/>)}</div> :
            items.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">لا توجد أسئلة في هذا القسم</p> :
            <div className="space-y-3">{items.map((q: Record<string,unknown>) => (
              <div key={q.id as number} className="rounded-lg border p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">❓</span>
                  <div className="flex-1"><p className="font-bold text-sm">{q.question as string}</p><p className="text-xs text-gray-400 mt-1">{q.userName as string} · {new Date(q.createdAt as string).toLocaleDateString('ar-SA')}</p></div>
                </div>
                {(q.isAnswered as boolean) && <div className="mt-3 flex items-start gap-3 border-t pt-3">
                  <span className="text-2xl">👩‍🎨</span>
                  <div className="flex-1"><p className="text-sm text-gray-700">{q.answer as string}</p><p className="text-xs text-brand-600 mt-1">{q.technicianName as string}</p></div>
                </div>}
              </div>
            ))}</div>
          }
        </Card>
      </div>
    </DashboardLayout>
  );
}
