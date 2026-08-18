'use client';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, Button, ErrorAlert } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import type { TranslationKey } from '@galaxy/shared';

const CHALLENGES: {
  key: string;
  emoji: string;
  name: TranslationKey;
  desc: TranslationKey;
  participants: number;
  duration: TranslationKey;
  prize: TranslationKey;
}[] = [
  {
    key: '7day_mask',
    emoji: '',
    name: 'socialChallenge.chal.mask',
    desc: 'socialChallenge.desc.mask',
    participants: 234,
    duration: 'socialChallenge.duration.mask',
    prize: 'socialChallenge.prize.mask',
  },
  {
    key: 'selfie_30',
    emoji: '',
    name: 'socialChallenge.chal.noMakeup',
    desc: 'socialChallenge.desc.noMakeup',
    participants: 156,
    duration: 'socialChallenge.duration.noMakeup',
    prize: 'socialChallenge.prize.noMakeup',
  },
  {
    key: 'water_challenge',
    emoji: '',
    name: 'socialChallenge.chal.water',
    desc: 'socialChallenge.desc.water',
    participants: 412,
    duration: 'socialChallenge.duration.water',
    prize: 'socialChallenge.prize.water',
  },
  {
    key: 'night_routine',
    emoji: '',
    name: 'socialChallenge.chal.nightRoutine',
    desc: 'socialChallenge.desc.nightRoutine',
    participants: 189,
    duration: 'socialChallenge.duration.nightRoutine',
    prize: 'socialChallenge.prize.nightRoutine',
  },
  {
    key: 'natural_hair',
    emoji: '‍️',
    name: 'socialChallenge.chal.naturalHair',
    desc: 'socialChallenge.desc.naturalHair',
    participants: 98,
    duration: 'socialChallenge.duration.naturalHair',
    prize: 'socialChallenge.prize.naturalHair',
  },
];

export default function SocialChallengesPage(): JSX.Element {
  const { t } = useLocale();
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
          <ErrorAlert message={t('socialChallenge.err.load')} onRetry={() => refetch()} />
        </div>
      </DashboardLayout>
    );

  const joined = (myChallenges ?? []).map((c: Record<string, unknown>) => c.challengeKey as string);

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('socialChallenge.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('socialChallenge.subtitle')}</p>
        </div>
        {joined.length > 0 && (
          <Card padding="lg">
            <h3 className="font-bold mb-3">
              {t('socialChallenge.myChallenges', { count: joined.length })}
            </h3>
            <div className="flex flex-wrap gap-2">
              {joined.map((k) => {
                const c = CHALLENGES.find((x) => x.key === k);
                return c ? (
                  <span key={k} className="rounded-full bg-amber-100 px-3 py-1 text-sm">
                    {c.emoji} {t(c.name)}
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
                    <h3 className="font-bold text-lg">{t(c.name)}</h3>
                    <p className="text-sm text-text-secondary">{t(c.desc)}</p>
                    <div className="mt-2 flex gap-4 text-xs text-text-secondary">
                      <span> {c.participants}</span>
                      <span>️ {t(c.duration)}</span>
                      <span> {t(c.prize)}</span>
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
                    {isJoined ? t('socialChallenge.joined') : t('socialChallenge.join')}
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
