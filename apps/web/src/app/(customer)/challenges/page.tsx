'use client';

import { api } from '@/lib/trpc';
import { PageContainer, PageTitle, Card, Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import type { TranslationKey } from '@galaxy/shared';

const CH: Record<string, { emoji: string; color: string; label: TranslationKey }> = {
  '7day_skincare': { emoji: '', color: '#ec4899', label: 'challenges.sevenDaySkincare' },
  '5bookings': { emoji: '‍️', color: '#f59e0b', label: 'challenges.fiveBookings' },
  first_review: { emoji: '', color: '#3b82f6', label: 'challenges.firstReview' },
  streak_4weeks: { emoji: '', color: '#8b5cf6', label: 'challenges.fourWeeksStreak' },
  refer_3friends: { emoji: '‍️', color: '#10b981', label: 'challenges.threeReferrals' },
};

export default function ChallengesPage(): JSX.Element {
  const { t } = useLocale();
  const listQuery = api.challenges.list.useQuery();
  const progressQuery = api.challenges.myProgress.useQuery();
  const joinMutation = api.challenges.join.useMutation({
    onSuccess: () => {
      listQuery.refetch();
      progressQuery.refetch();
    },
  });

  const challenges = listQuery.data ?? [];
  const progress = progressQuery.data;

  const join = (challengeId: string) => {
    joinMutation.mutate({ challengeId });
  };

  return (
    <DashboardLayout userRole="CUSTOMER">
      <PageContainer width="default">
        <PageTitle title={t('challenges.title')} subtitle={t('challenges.subtitle')} />

        <div className="space-y-4">
          {challenges.map((c) => {
            const cfg = CH[c.id] ?? { emoji: '', color: '#6b7280', label: c.id };
            const prog =
              c.id === '5bookings'
                ? { current: progress?.bookingCount ?? 0, total: 5 }
                : c.id === 'first_review'
                  ? { current: progress?.reviewCount ?? 0, total: 1 }
                  : undefined;
            return (
              <Card key={c.id} className="flex items-center gap-4 p-5">
                <span className="text-4xl">{cfg.emoji}</span>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-text-primary dark:text-gray-100">
                    {t(cfg.label)}
                  </h4>
                  {prog && (
                    <p className="mt-1 text-xs text-text-tertiary dark:text-gray-500">
                      {prog.current}/{prog.total} — {Math.round((prog.current / prog.total) * 100)}%
                    </p>
                  )}
                  {prog && (
                    <div className="mt-2 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.round((prog.current / prog.total) * 100)}%`,
                          backgroundColor: cfg.color,
                        }}
                      />
                    </div>
                  )}
                </div>
                <Button onClick={() => join(c.id)} className="shrink-0">
                  {t('challenges.join')}
                </Button>
              </Card>
            );
          })}
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
