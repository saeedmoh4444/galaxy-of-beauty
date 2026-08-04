'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button, Modal } from '@galaxy/ui';
import { useAuth } from '@galaxy/ui';
import Link from 'next/link';

export default function TechnicianQAPage(): JSX.Element {
  const { user } = useAuth();
  const [category, setCategory] = useState<string | undefined>();
  const [showAsk, setShowAsk] = useState(false);
  const [question, setQuestion] = useState('');
  const [qCategory, setQCategory] = useState('general');

  const { data, isLoading, isError, refetch } = api.technicianQA.list.useQuery({ category, page: 1, limit: 50 }) as { data: { items: Array<Record<string, unknown>> } | undefined; isLoading: boolean; isError: boolean; refetch: () => void };
  const { data: cats } = api.technicianQA.categories.useQuery() as { data: Array<{ key: string; nameAr: string; emoji: string }> | undefined };
  const askMut = api.technicianQA.ask.useMutation({ onSuccess: () => { setShowAsk(false); setQuestion(''); refetch(); } });

  const items = data?.items ?? [];
  const categories = cats ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold">💬 اسألي الفنيات</h1>
        <p className="mt-2 text-text-secondary">اسألي خبراء التجميل — تجاوب الفنيات على أسئلتكِ</p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setCategory(undefined)} className={`rounded-full px-3 py-1 text-xs font-medium ${!category ? 'bg-brand-600 text-white' : 'bg-surface-muted dark:bg-gray-800'}`}>الكل</button>
          {categories.map((c) => <button key={c.key} onClick={() => setCategory(c.key)} className={`rounded-full px-3 py-1 text-xs font-medium ${category === c.key ? 'bg-brand-600 text-white' : 'bg-surface-muted dark:bg-gray-800'}`}>{c.emoji} {c.nameAr}</button>)}
        </div>
        {user && <Button size="sm" onClick={() => setShowAsk(true)}>+ اسألي</Button>}
      </div>

      {isLoading ? <div className="space-y-3">{Array.from({ length: 3 }, (_, i) => <CardSkeleton key={i} />)}</div>
      : isError ? <ErrorAlert message="فشل التحميل" onRetry={() => refetch()} />
      : items.length === 0 ? <EmptyState title="لا توجد أسئلة بعد" description="كوني أول من يسأل!" action={user ? { label: 'اسألي الآن', onPress: () => setShowAsk(true) } : undefined} />
      : <div className="space-y-3">
          {items.map((item: Record<string, unknown>) => (
            <Card key={item.id as number} padding="md">
              <div className="flex items-start gap-3">
                <span className="text-2xl">❓</span>
                <div className="flex-1">
                  <p className="font-bold text-sm text-text-primary dark:text-gray-100">{item.question as string}</p>
                  {item.isAnswered ? (
                    <div className="mt-2 rounded-xl bg-green-50 dark:bg-green-950 p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">👩‍🎨</span>
                        <span className="text-xs font-bold text-green-700 dark:text-green-300">{item.technicianName as string}</span>
                      </div>
                      <p className="text-sm text-text-primary dark:text-gray-300">{item.answer as string}</p>
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-amber-500">⏳ في انتظار الرد</p>
                  )}
                  <p className="mt-1 text-[10px] text-text-tertiary">{item.userName as string} · {new Date(item.createdAt as string).toLocaleDateString('ar-SA')}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      }

      {!user && (
        <div className="mt-8 text-center">
          <Link href="/login"><Button>سجّلي دخول للسؤال</Button></Link>
        </div>
      )}

      <Modal open={showAsk} onClose={() => setShowAsk(false)} title="اسألي الفنيات">
        <div className="space-y-4">
          <div><label className="block text-sm font-semibold mb-1">الفئة</label><select value={qCategory} onChange={(e) => setQCategory(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800">{categories.map((c) => <option key={c.key} value={c.key}>{c.emoji} {c.nameAr}</option>)}</select></div>
          <div><label className="block text-sm font-semibold mb-1">سؤالكِ</label><textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} placeholder="اكتبي سؤالكِ هنا..." className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" maxLength={500} /></div>
          <div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setShowAsk(false)}>إلغاء</Button><Button onClick={() => { if (question.trim().length >= 5) askMut.mutate({ question: question.trim(), category: qCategory as 'makeup' | 'hair' | 'skincare' | 'nails' | 'general' }); }} loading={askMut.isPending}>إرسال ✉️</Button></div>
        </div>
      </Modal>
    </div>
  );
}
