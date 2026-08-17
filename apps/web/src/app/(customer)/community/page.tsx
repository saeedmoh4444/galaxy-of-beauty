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
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function CommunityPage(): JSX.Element {
  const circles = api.beautyCircles.list.useQuery({ limit: 6 });
  const kindness = api.kindnessPoints.getStatus.useQuery();
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
        <PageTitle title="مجتمع الجمال" subtitle="تواصلي، شاركي، وانتمي" />

        {isError ? (
          <ErrorAlert message="فشل تحميل بيانات المجتمع" onRetry={refetch} />
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
                <h2 className="mb-3 text-lg font-semibold text-text-primary">دوائر الجمال</h2>
                {circles.isLoading ? (
                  <CardListSkeleton count={3} />
                ) : !circles?.data?.items?.length ? (
                  <p className="text-sm text-text-tertiary">
                    لا توجد دوائر بعد — كوني أول من ينشئ واحدة!
                  </p>
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
                  <h2 className="mb-3 text-lg font-semibold text-text-primary">لقاءات قريبة</h2>
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
                    title: 'قصة نجاح — من الصفر للاحتراف',
                    guest: 'نورة القحطاني',
                    duration: '32 دقيقة',
                    episodeNumber: 12,
                  }}
                />
                <InspirationBoardCard
                  pins={[
                    { emoji: '', title: 'تسريحة ناعمة', savedBy: 'نورة' },
                    { emoji: '', title: 'مكياج السهرة', savedBy: 'مها' },
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
                  story: 'بدأت من الصفر ووصلت لأفضل خبيرة مكياج في الرياض',
                  achievement: 'درّبت 500 خبيرة',
                  city: 'الرياض',
                }}
              />
              <MentorBadge />
              <BeautyPenPalCard match={{ city: 'جدة', interest: 'مكياج', emoji: '' }} />
              <HijabiBeautyCard />
            </div>
          </div>
        )}
      </PageContainer>
    </DashboardLayout>
  );
}
