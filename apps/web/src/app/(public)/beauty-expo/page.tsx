'use client';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton } from '@galaxy/shared';

export default function BeautyExpoPage(): JSX.Element {
  const { data, isLoading } = api.beautyExpo.booths.useQuery() as { data: Array<Record<string,unknown>> | undefined; isLoading: boolean };
  const booths = data ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 text-center"><span className="text-6xl">🎪</span><h1 className="mt-4 text-3xl font-bold">معرض التجميل الافتراضي</h1><p className="mt-2 text-text-secondary">تجولي في أجنحة أشهر الماركات العالمية</p></div>
      {isLoading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({length:5},(_,i)=><CardSkeleton key={i}/>)}</div> :
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{booths.map((b: Record<string,unknown>) => (
          <Card key={b.id as number} padding="lg" className="text-center hover:shadow-xl transition-all">
            <span className="text-5xl">{b.emoji as string}</span>
            <h3 className="mt-3 text-lg font-bold">{b.brand as string}</h3>
            <p className="text-sm text-text-secondary mt-1">{b.description as string}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-1">{(b.products as string[]).map((p: string) => <span key={p} className="rounded-full bg-brand-50 dark:bg-brand-950 px-2 py-0.5 text-[10px]">{p}</span>)}</div>
            <p className="text-xs text-text-tertiary mt-3">👥 {b.visitors as number} زائر</p>
          </Card>
        ))}</div>
      }
    </div>
  );
}
