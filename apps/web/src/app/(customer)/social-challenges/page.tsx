'use client';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, Button, ErrorAlert } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const CHALLENGES = [
  {
    key: '7day_mask',
    emoji: '',
    name: 'تحدي ٧ أيام قناع',
    desc: 'قناع يومي للبشرة لمدة أسبوع',
    participants: 234,
    duration: '7 أيام',
    prize: 'قناع مجاني',
  },
  {
    key: 'selfie_30',
    emoji: '',
    name: 'تحدي ٣٠ يوم بدون مكياج',
    desc: 'صوري بشرتكِ يومياً بدون مكياج',
    participants: 156,
    duration: '30 يوم',
    prize: 'جلسة عناية مجانية',
  },
  {
    key: 'water_challenge',
    emoji: '',
    name: 'تحدي ٨ أكواب ماء',
    desc: 'اشربي ٨ أكواب ماء يومياً',
    participants: 412,
    duration: '14 يوم',
    prize: 'منتجات ترطيب',
  },
  {
    key: 'night_routine',
    emoji: '',
    name: 'تحدي الروتين الليلي',
    desc: 'التزمي بروتينكِ الليلي لمدة ٢١ يوم',
    participants: 189,
    duration: '21 يوم',
    prize: 'باقة عناية ليلية',
  },
  {
    key: 'natural_hair',
    emoji: '‍️',
    name: 'تحدي شعر طبيعي',
    desc: 'تجنبي الحرارة لمدة أسبوعين',
    participants: 98,
    duration: '14 يوم',
    prize: 'علاج شعر طبيعي',
  },
];

export default function SocialChallengesPage(): JSX.Element {
  const {
    data: myChallenges,
    isLoading,
    isError,
    refetch,
  } = api.socialChallenges.myChallenges.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const joinMut = api.socialChallenges.join.useMutation();
  const leaveMut = api.socialChallenges.leave.useMutation();

  if (isLoading)
    return (
      <DashboardLayout userRole="CUSTOMER">
        <div className="mx-auto max-w-3xl space-y-6">
          <CardListSkeleton count={5} />
        </div>
      </DashboardLayout>
    );
  if (isError)
    return (
      <DashboardLayout userRole="CUSTOMER">
        <div className="mx-auto max-w-3xl space-y-6">
          <ErrorAlert message="فشل تحميل البيانات" onRetry={() => refetch()} />
        </div>
      </DashboardLayout>
    );

  const joined = (myChallenges ?? []).map((c: Record<string, unknown>) => c.challengeKey as string);

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold"> تحديات اجتماعية</h1>
          <p className="mt-1 text-sm text-text-secondary">انضمي للتحديات الجماعية وكسبي مكافآت</p>
        </div>
        {joined.length > 0 && (
          <Card padding="lg">
            <h3 className="font-bold mb-3"> تحدياتي ({joined.length})</h3>
            <div className="flex flex-wrap gap-2">
              {joined.map((k) => {
                const c = CHALLENGES.find((x) => x.key === k);
                return c ? (
                  <span key={k} className="rounded-full bg-amber-100 px-3 py-1 text-sm">
                    {c.emoji} {c.name}
                  </span>
                ) : null;
              })}
            </div>
          </Card>
        )}
        <div className="space-y-4">
          {CHALLENGES.map((c) => {
            const isJoined = joined.includes(c.key);
            return (
              <Card key={c.key} padding="lg">
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{c.emoji}</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{c.name}</h3>
                    <p className="text-sm text-text-secondary">{c.desc}</p>
                    <div className="mt-2 flex gap-4 text-xs text-text-secondary">
                      <span> {c.participants}</span>
                      <span>️ {c.duration}</span>
                      <span> {c.prize}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={isJoined ? 'outline' : 'primary'}
                    onClick={() =>
                      isJoined
                        ? leaveMut.mutate({ challengeKey: c.key })
                        : joinMut.mutate({ challengeKey: c.key })
                    }
                  >
                    {isJoined ? ' منضم' : 'انضمام'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
