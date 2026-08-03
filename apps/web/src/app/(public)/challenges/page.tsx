'use client';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton } from '@galaxy/shared';
export default function ChallengesPage(): JSX.Element {
  const { data: challenges, isLoading } = api.challenges.list.useQuery() as { data: Array<Record<string,unknown>> | undefined; isLoading: boolean; isError: boolean; refetch: () => void };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <div className="text-center"><h1 className="text-3xl font-bold">🏆 تحديات الجمال</h1><p className="mt-2 text-text-secondary">أكملي التحديات واكسبي مكافآت حصرية</p></div>

      {isLoading ? <div className="space-y-4">{Array.from({length:4},(_,i)=><CardSkeleton key={i}/>)}</div> :
        !(challenges??[]).length ? <Card padding="lg" className="text-center py-8"><p className="text-4xl mb-2">🏆</p><p className="text-text-secondary">لا توجد تحديات حالياً</p></Card> :
        <div className="space-y-4">{(challenges??[]).map((c: Record<string,unknown>) => (
          <Card key={c.key as string} padding="lg">
            <div className="flex items-start gap-4">
              <span className="text-4xl">{c.emoji as string ?? '🏆'}</span>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{c.name as string ?? c.key}</h3>
                <p className="text-sm text-text-secondary mt-1">{c.desc as string ?? ''}</p>
                <div className="mt-3 flex gap-4 text-xs text-text-secondary">
                  <span>⏱️ {c.duration as string ?? ''}</span>
                  <span>👥 {c.participants as number ?? 0} مشاركة</span>
                  <span>🎁 {c.prize as string ?? ''}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}</div>
      }
    </div>
  );
}
