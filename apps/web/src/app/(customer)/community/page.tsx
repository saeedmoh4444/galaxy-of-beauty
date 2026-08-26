'use client';

import type { ComponentProps } from 'react';
import { api } from '@/lib/trpc';
import {
  PageContainer,
  ErrorAlert,
  PageTitle,
  CardListSkeleton,
  SisterhoodWall,
  BeautyCircleCard,
  KindnessPointsBadge,
  BeautyHeroBadge,
  BeautyPodcastCard,
  MentorBadge,
  ReferralRewardBadge,
  CommunityEventCard,
  InspirationBoardCard,
  GroupDiscountBadge,
  BeautyPenPalCard,
  HijabiBeautyCard,
  useAuth,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

export default function CommunityPage(): JSX.Element {
  const { t } = useLocale();
  const { isAuthenticated } = useAuth();
  const circles = api.beautyCircles.list.useQuery({ limit: 6 });
  // Auth-gated: an expired cookie still passes the middleware, so gate
  // the query on the real session to avoid an error banner for guests.
  const kindness = api.kindnessPoints.getStatus.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const events = api.communityEvents.list.useQuery({ limit: 3 });
  // beautyCircles.getHero doesn't exist — the hero badge shows its
  // built-in fallback member until product decides the intended source.
  const myCode = api.referrals.getMyCode.useQuery();
  const referralStats = api.referrals.getStats.useQuery();

  const isLoading = circles.isLoading || kindness.isLoading;
  const isError = circles.isError || kindness.isError;
  const refetch = () => {
    circles.refetch();
    kindness.refetch();
  };

  return (
    <DashboardLayout userRole="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle title={t('community.title')} subtitle={t('community.subtitle')} />

        {isError ? (
          <ErrorAlert message={t('community.loadError')} onRetry={refetch} />
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main feed */}
            <div className="lg:col-span-2 space-y-6">
              <SisterhoodWall />

              <div className="grid gap-4 sm:grid-cols-2">
                <ReferralRewardBadge
                  referralCode={myCode?.data?.code ?? 'SHARE'}
                  referrals={referralStats?.data?.totalReferred ?? 0}
                  discount={15}
                />
                <GroupDiscountBadge groupSize={3} discount={15} />
              </div>

              {/* Circles */}
              <div>
                <h2 className="mb-3 text-lg font-semibold text-text-primary">
                  {t('community.circlesTitle')}
                </h2>
                {circles.isLoading ? (
                  <CardListSkeleton count={3} />
                ) : !circles?.data?.items?.length ? (
                  <p className="text-sm text-text-tertiary">{t('community.noCircles')}</p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {circles.data.items.slice(0, 3).map((c) => (
                      <BeautyCircleCard
                        key={c.id}
                        circle={{
                          name: c.name,
                          topic: (c.topic || 'skincare') as ComponentProps<
                            typeof BeautyCircleCard
                          >['circle']['topic'],
                          members: c.members ?? 0,
                          cover: c.cover ?? '',
                          city: c.city ?? undefined,
                          groupDiscount: (c as Record<string, unknown>).groupDiscount as
                            number | undefined,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Events */}
              {events?.data?.items?.length ? (
                <div>
                  <h2 className="mb-3 text-lg font-semibold text-text-primary">
                    {t('community.upcomingEvents')}
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {events.data.items.slice(0, 2).map((e) => (
                      <CommunityEventCard
                        key={e.id}
                        event={{
                          title: e.title,
                          date: e.date,
                          city: e.city,
                          time: e.time ?? undefined,
                          maxAttendees: e.maxAttendees ?? undefined,
                        }}
                      />
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Podcast + Inspiration */}
              <div className="grid gap-4 sm:grid-cols-2">
                <BeautyPodcastCard
                  episode={{
                    title: t('community.episodeTitle'),
                    guest: 'نورة القحطاني',
                    duration: t('community.episodeDuration'),
                    episodeNumber: 12,
                  }}
                />
                <InspirationBoardCard
                  pins={[
                    { emoji: '', title: t('community.pinSoftHairstyle'), savedBy: 'نورة' },
                    { emoji: '', title: t('community.pinPartyMakeup'), savedBy: 'مها' },
                  ]}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {isLoading ? (
                <CardListSkeleton count={2} />
              ) : (
                <KindnessPointsBadge points={kindness?.data?.points ?? 0} />
              )}
              <BeautyHeroBadge
                member={{
                  name: 'نورة القحطاني',
                  story: t('community.heroStory'),
                  achievement: t('community.heroAchievement'),
                  city: 'الرياض',
                }}
              />
              <MentorBadge />
              <BeautyPenPalCard
                match={{ city: 'جدة', interest: t('community.interestMakeup'), emoji: '' }}
              />
              <HijabiBeautyCard />
            </div>
          </div>
        )}
      </PageContainer>
    </DashboardLayout>
  );
}
