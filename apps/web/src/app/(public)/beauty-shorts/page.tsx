'use client';
import { api } from '@/lib/trpc';
import { CardSkeleton } from '@galaxy/ui';
export default function BeautyShortsPage(): JSX.Element {
  const { data, isLoading } = api.beautyShorts.feed.useQuery() as { data: Array<Record<string,unknown>> | undefined; isLoading: boolean; isError: boolean; refetch: () => void };
  const shorts = data ?? [];
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="mb-8 text-center"><span className="text-6xl">📹</span><h1 className="mt-4 text-3xl font-bold">Beauty Shorts</h1><p className="mt-2 text-text-secondary">فيديوهات قصيرة وسريعة</p></div>
      {isLoading ? <div className="space-y-4">{Array.from({length:3},(_,i)=><CardSkeleton key={i}/>)}</div> :
        <div className="space-y-4">{shorts.map((s: Record<string,unknown>) => (
          <div key={s.id as number} className="relative rounded-2xl h-96 bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center text-white overflow-hidden">
            <span className="text-6xl">{s.emoji as string}</span>
            <h3 className="font-bold mt-4 text-center px-4">{s.title as string}</h3>
            <p className="text-white/60 text-sm mt-1">👩‍🎨 {s.technician as string} · ⏱️ {s.duration as string}</p>
            <div className="absolute bottom-4 left-4 right-4 flex justify-between text-sm"><span>❤️ {s.likes as number}</span><span>👁️ {(s.views as number).toLocaleString()}</span></div>
          </div>
        ))}</div>
      }
    </div>
  );
}
