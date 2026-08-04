'use client';

import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState } from '@galaxy/ui';
import Link from 'next/link';

export default function LiveStreamPage(): JSX.Element {
  const { data, isLoading, isError, refetch } = (api as any).liveStream.list.useQuery() as {
    data: { live: Array<Record<string,unknown>>; upcoming: Array<Record<string,unknown>>; categories: Array<{key:string;nameAr:string;emoji:string}> } | undefined;
    isLoading: boolean; isError: boolean; refetch: () => void;
  };

  const live = data?.live ?? [];
  const upcoming = data?.upcoming ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10 text-center">
        <span className="text-6xl">🎥</span>
        <h1 className="mt-4 text-3xl font-bold text-text-primary dark:text-gray-100">البث المباشر</h1>
        <p className="mt-2 text-text-secondary">تابعي جلسات البث المباشر من خبراء التجميل — تعلمي وتفاعلي مباشرة</p>
      </div>

      {isLoading ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{Array.from({length:3},(_,i)=><CardSkeleton key={i}/>)}</div>
      : isError ? <ErrorAlert message="فشل التحميل" onRetry={()=>refetch()} />
      : live.length === 0 && upcoming.length === 0 ? <EmptyState title="لا توجد بثوث حالياً" description="لم تبدأ أي بثوث مباشرة بعد" />
      : <>
        {live.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-6 text-xl font-bold">🔴 مباشر الآن</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {live.map((s: Record<string,unknown>) => (
                <Link key={s.id as number} href={`/live-stream/${s.id}`}>
                  <Card padding="none" className="overflow-hidden hover:shadow-xl transition-all group">
                    <div className="relative flex h-44 items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                      <div className="text-center text-white/60"><span className="text-6xl">🎥</span></div>
                      <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white animate-pulse">🔴 مباشر</span>
                      <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-xs text-white">{s.viewerCount as number} مشاهد</span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold group-hover:text-brand-600 transition-colors">{s.titleAr as string}</h3>
                      <p className="text-xs text-text-secondary mt-1">{s.technicianName as string}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
        {upcoming.length > 0 && (
          <div>
            <h2 className="mb-6 text-xl font-bold">📅 قادم</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((s: Record<string,unknown>) => (
                <Card key={s.id as number} padding="lg" className="opacity-70 hover:opacity-100 transition-all">
                  <div className="text-5xl text-center">📅</div>
                  <h3 className="mt-3 font-bold text-center">{s.titleAr as string}</h3>
                  <p className="text-xs text-text-secondary text-center mt-1">{s.technicianName as string}</p>
                  <p className="text-xs text-brand-600 text-center mt-2 font-semibold">{new Date(s.startedAt as string).toLocaleDateString('ar-SA', {month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'})}</p>
                </Card>
              ))}
            </div>
          </div>
        )}
      </>}
    </div>
  );
}
