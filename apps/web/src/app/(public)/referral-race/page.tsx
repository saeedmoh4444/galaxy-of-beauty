'use client';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, Button } from '@galaxy/ui';
import { useAuth } from '@galaxy/ui';

export default function ReferralRacePage(): JSX.Element {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = api.referralRace.leaderboard.useQuery() as { data: Record<string,unknown> | undefined; isLoading: boolean; isError: boolean; refetch: () => void };
  const { data: myRank } = api.referralRace.myRank.useQuery() as { data: Record<string,unknown> | undefined };
  const shareMut = api.referralRace.share.useMutation();

  const leaders = (data?.leaders ?? []) as Array<Record<string,unknown>>;
  const days = (data?.remainingDays as number) ?? 0;
  const prizes = (data?.prizes ?? []) as string[];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 text-center"><span className="text-6xl">🎫</span><h1 className="mt-4 text-3xl font-bold">سباق الإحالات</h1><p className="mt-2 text-text-secondary">تنافسي مع صديقاتكِ واكسبي جوائز! متبقي {days} يوم</p></div>

      {isLoading ? <CardSkeleton /> : isError ? <ErrorAlert message="فشل التحميل" onRetry={() => refetch()} /> : (
        <Card padding="lg">
          <div className="flex gap-2 mb-4">{prizes.map((p: string, i: number) => <span key={i} className="rounded-full bg-amber-100 dark:bg-amber-900 px-3 py-1 text-xs font-bold">{p}</span>)}</div>
          <div className="space-y-2">{leaders.map((l: Record<string,unknown>, idx: number) => (
            <div key={l.userId as number} className="flex items-center gap-3 rounded-lg bg-surface-muted dark:bg-gray-800 p-3">
              <span className="text-xl w-8 text-center">{['🥇','🥈','🥉'][idx] ?? `#${idx+1}`}</span>
              <div className="flex-1"><span className="font-bold">{l.userName as string}</span></div>
              <span className="font-bold text-brand-600">{l.referralCount as number} 👥</span>
            </div>
          ))}</div>
        </Card>
      )}
      {myRank && <Card padding="md" className="mt-4 text-center"><p>موقعك: <span className="font-bold text-brand-600">#{(myRank.rank as number) ?? '-'}</span> · {(myRank.count as number) ?? 0} إحالة</p></Card>}
      {user && <div className="mt-4 text-center"><Button onClick={() => shareMut.mutate({ platform: 'whatsapp' })}>📤 شاركي الرابط</Button></div>}
    </div>
  );
}
