'use client';
import { api } from '@/lib/trpc';
import { CardSkeleton } from '@galaxy/shared';
import { ErrorAlert } from '@galaxy/shared';

export default function BeautyStoriesPage(): JSX.Element {
  const { data, isLoading } = api.beautyStories.feed.useQuery() as { data: Array<Record<string,unknown>> | undefined; isLoading: boolean; isError: boolean; refetch: () => void };
  const stories = data ?? [];
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 text-center"><span className="text-6xl">📖</span><h1 className="mt-4 text-3xl font-bold">Beauty Stories</h1><p className="mt-2 text-gray-500">قصص يومية من فنياتنا</p></div>
      {isLoading ? <div className="flex gap-4 justify-center">{Array.from({length:4},(_,i)=><div key={i} className="w-32 h-48"><CardSkeleton/></div>)}</div> :
        <div className="flex gap-4 justify-center flex-wrap">
          {stories.map((s: Record<string,unknown>) => (
            <button key={s.id as number} className="relative w-32 h-48 rounded-2xl bg-gradient-to-br from-brand-400 to-purple-500 text-white flex flex-col items-center justify-end p-3 hover:scale-105 transition-all shadow-lg">
              <span className="text-4xl">{s.emoji as string}</span>
              <p className="text-[10px] font-bold mt-2">{s.technicianName as string}</p>
              <p className="text-[8px] opacity-70">{s.postedAt as string}</p>
              <span className="absolute top-2 right-2 rounded-full bg-white/20 px-2 py-0.5 text-[9px]">{s.viewers as number} 👁️</span>
            </button>
          ))}
        </div>
      }
    </div>
  );
}
