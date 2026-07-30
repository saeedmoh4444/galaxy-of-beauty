'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, Button, Modal } from '@galaxy/shared';
import { useAuth } from '@galaxy/shared';

export default function VideoTestimonialsPage(): JSX.Element {
  const { user } = useAuth();
  const { data, isLoading } = api.videoTestimonials.feed.useQuery({ page: 1, limit: 12 }) as { data: { items: Array<Record<string,unknown>> } | undefined; isLoading: boolean };
  const submitMut = api.videoTestimonials.submit.useMutation();
  const [show, setShow] = useState(false); const [vUrl, setVUrl] = useState(''); const [rating, setRating] = useState(5); const [comment, setComment] = useState(''); const [techName, setTechName] = useState(''); const [svcName, setSvcName] = useState('');

  const items = data?.items ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 text-center"><span className="text-6xl">🎥</span><h1 className="mt-4 text-3xl font-bold">توصيات بالفيديو</h1><p className="mt-2 text-gray-500">شوفي تجارب حقيقية من العميلات</p></div>
      {user && <div className="text-center mb-6"><Button onClick={() => setShow(true)}>🎥 شاركي فيديوكِ</Button></div>}
      {isLoading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({length:6},(_,i)=><CardSkeleton key={i}/>)}</div> :
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map((t: Record<string,unknown>) => (
          <Card key={t.id as number} padding="md">
            <div className="h-36 rounded-xl bg-gray-800 flex items-center justify-center text-4xl">▶️</div>
            <div className="mt-2 flex items-center gap-1"><span className="text-sm font-bold">{t.userName as string}</span><span className="text-amber-500">{'⭐'.repeat(t.rating as number)}</span></div>
            <p className="text-sm mt-1">{t.comment as string}</p><p className="text-xs text-gray-500 mt-1">👩‍🎨 {t.technicianName as string} · {t.serviceName as string} · ❤️ {t.likes as number}</p>
          </Card>
        ))}</div>
      }
      <Modal open={show} onClose={() => setShow(false)} title="شاركي فيديو"><div className="space-y-3">
        <input value={vUrl} onChange={(e) => setVUrl(e.target.value)} placeholder="رابط الفيديو" className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
        <div className="grid grid-cols-2 gap-3"><input value={techName} onChange={(e) => setTechName(e.target.value)} placeholder="اسم الفنية" className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" /><input value={svcName} onChange={(e) => setSvcName(e.target.value)} placeholder="الخدمة" className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" /></div>
        <div className="flex items-center gap-2"><span className="text-sm">التقييم:</span>{[1,2,3,4,5].map((s) => <button key={s} onClick={() => setRating(s)} className={`text-2xl ${s <= rating ? 'text-amber-500' : 'text-gray-300'}`}>★</button>)}</div>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={300} placeholder="تعليقك..." className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" rows={2} />
        <Button onClick={() => { if (vUrl && techName && svcName) submitMut.mutate({ videoUrl: vUrl, rating, comment, technicianName: techName, serviceName: svcName }); }} loading={submitMut.isPending} className="w-full">🎥 نشر</Button>
      </div></Modal>
    </div>
  );
}
