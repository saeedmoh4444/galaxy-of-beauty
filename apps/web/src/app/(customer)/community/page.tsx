'use client';

import { api } from '@/lib/trpc';
import {
  PageContainer, ErrorAlert, PageTitle, CardListSkeleton,
  SisterhoodWall, BeautyCircleCard, KindnessPointsBadge,
  BeautyHeroBadge, BeautyPodcastCard, MentorBadge,
  ReferralRewardBadge, CommunityEventCard, InspirationBoardCard,
  GroupDiscountBadge, BeautyPenPalCard, HijabiBeautyCard,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function CommunityPage(): JSX.Element {
  const circles = (api as any).beautyCircles?.list?.useQuery?.({ limit: 6 }) as any;
  const compliments = (api as any).sisterhoodCompliments?.list?.useQuery?.({ limit: 4 }) as any;
  const kindness = (api as any).kindnessPoints?.getStatus?.useQuery?.() as any;
  const events = (api as any).communityEvents?.list?.useQuery?.({ limit: 3 }) as any;

  return (
    <DashboardLayout role="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle title="مجتمع الجمال" subtitle="تواصلي، شاركي، وانتمي" />

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main feed */}
          <div className="lg:col-span-2 space-y-6">
            <SisterhoodWall />

            <div className="grid gap-4 sm:grid-cols-2">
              <ReferralRewardBadge referralCode="SHARE" referrals={kindness?.data?.totalReferrals ?? 0} />
              <GroupDiscountBadge groupSize={3} discount={15} />
            </div>

            {/* Circles */}
            <div>
              <h2 className="mb-3 text-lg font-semibold text-text-primary">دوائر الجمال</h2>
              {circles.isLoading ? <CardListSkeleton count={3} /> : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {(circles?.data?.items as any[])?.slice(0, 3).map((c: any) => (
                    <BeautyCircleCard
                      key={c.id}
                      circle={{
                        name: c.name, topic: c.topic || 'skincare',
                        members: c.members ?? 0, cover: c.cover ?? '🌸',
                        city: c.city, groupDiscount: c.groupDiscount,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Events */}
            {events?.data?.items?.length > 0 && (
              <div>
                <h2 className="mb-3 text-lg font-semibold text-text-primary">لقاءات قريبة</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {(events.data.items as any[]).slice(0, 2).map((e: any) => (
                    <CommunityEventCard key={e.id} event={e} />
                  ))}
                </div>
              </div>
            )}

            {/* Podcast + Inspiration */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyPodcastCard episode={{ title: 'قصة نجاح — من الصفر للاحتراف', guest: 'نورة القحطاني', duration: '32 دقيقة', episodeNumber: 12 }} />
              <InspirationBoardCard pins={[{ emoji: '💇', title: 'تسريحة ناعمة', savedBy: 'نورة' }, { emoji: '💄', title: 'مكياج السهرة', savedBy: 'مها' }]} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <KindnessPointsBadge points={kindness?.data?.points ?? 0} />
            <BeautyHeroBadge member={{ name: 'نورة القحطاني', story: 'بدأت من الصفر ووصلت لأفضل خبيرة مكياج في الرياض', achievement: 'درّبت 500 خبيرة', city: 'الرياض' }} />
            <MentorBadge />
            <BeautyPenPalCard match={{ city: 'جدة', interest: 'مكياج', emoji: '💄' }} />
            <HijabiBeautyCard />
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
