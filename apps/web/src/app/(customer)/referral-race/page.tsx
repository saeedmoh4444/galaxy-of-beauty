'use client';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function ReferralRacePage(): JSX.Element {
  const { data: race, isLoading } = api.referralRace.leaderboard.useQuery() as { data: Record<string,unknown> | undefined; isLoading: boolean };
  const { data: myRank } = api.referralRace.myRank.useQuery() as { data: Record<string,unknown> | undefined };
  const shareMut = api.referralRace.share.useMutation();
  const leaders = (race?.leaders as Array<Record<string,unknown>>) ?? [];
  const prizes = (race?.prizes as string[]) ?? [];
  const remainingDays = race?.remainingDays as number ?? 0;
  const medals = ['🥇','🥈','🥉'];

  const handleShare = (platform: 'whatsapp' | 'twitter' | 'copy') => {
    shareMut.mutate({ platform }, { onSuccess: (result) => {
      const r = result as Record<string,unknown>;
      if (platform === 'copy') navigator.clipboard?.writeText(r.url as string);
      else window.open(r.url as string, '_blank');
    }});
  };

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div><h1 className="text-2xl font-bold">🏁 سباق الإحالات</h1><p className="mt-1 text-sm text-gray-500">شاركي رابطكِ واكسبي جوائز — متبقي {remainingDays} يوم</p></div>

        {myRank && (myRank.rank as number) && <Card padding="lg" className="text-center border-2 border-amber-300 bg-amber-50">
          <p className="text-sm text-gray-500">ترتيبكِ الحالي</p>
          <p className="text-3xl font-extrabold text-amber-600 mt-1">#{myRank.rank as number} — {myRank.count as number} إحالة</p>
          {(myRank.prize as string) && <p className="text-sm text-amber-700 mt-1">🎁 {myRank.prize as string}</p>}
        </Card>}

        <Card padding="lg"><h3 className="font-bold mb-3">🎁 الجوائز</h3>
          <div className="flex flex-wrap gap-2">{(prizes).map((p: string, i: number) => <span key={i} className="rounded-full bg-amber-100 px-3 py-1 text-sm">{p}</span>)}</div>
        </Card>

        {isLoading ? <CardSkeleton/> :
          <Card padding="lg"><h3 className="font-bold mb-3">🏆 المتصدرات</h3>
            <div className="space-y-2">{leaders.map((l: Record<string,unknown>, i: number) => (
              <div key={i} className={`flex items-center gap-4 rounded-lg p-3 ${(myRank?.rank as number)===l.rank?'border-2 border-brand-400 bg-brand-50':''}`}>
                <span className="text-xl w-8 text-center">{i < 3 ? medals[i] : `#${l.rank}`}</span>
                <div className="flex-1"><p className="font-bold">{l.userName as string}</p><p className="text-xs text-gray-500">{l.referralCount as number} إحالة</p></div>
                {(l.prize as string) && <span className="text-xs text-amber-600">🎁 {l.prize as string}</span>}
              </div>
            ))}</div>
          </Card>
        }

        <Card padding="lg"><h3 className="font-bold mb-3">📤 شاركي رابطكِ</h3>
          <div className="flex gap-2">
            <Button onClick={() => handleShare('whatsapp')} loading={shareMut.isPending} className="flex-1">💬 واتساب</Button>
            <Button onClick={() => handleShare('twitter')} loading={shareMut.isPending} className="flex-1">🐦 تويتر</Button>
            <Button onClick={() => handleShare('copy')} loading={shareMut.isPending} variant="outline">📋 نسخ</Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
