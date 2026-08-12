'use client';

import { api } from '@/lib/trpc';
import {
  PageContainer,
  PageTitle,
  PersonalStylingCard,
  BeautyTimeCapsuleCard,
  BeautyDreamBoardCard,
  BeautySecretSantaCard,
  BeautyVlogCard,
  BeautyPenPalCard,
  BeautyAccountabilityCard,
  BeautyGratefulCircleCard,
  BeautyAffirmationCard,
  BeautyGratitudeCard,
  BeautyReferralLeaderboardCard,
  GroupDiscountBadge,
  ReferralRewardBadge,
  InspirationBoardCard,
  SharedWishlistCard,
  BeautySeasonalLookbookCard,
  BridalBeautyCountdown,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function BeautyExtrasPage(): JSX.Element {
  const wishlist = (api as any).wishlist?.list?.useQuery?.() as any;
  const referral = (api as any).referrals?.myStats?.useQuery?.() as any;
  const styleMatch = (api as any).styleMatch?.getProfile?.useQuery?.() as any;

  return (
    <DashboardLayout role="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle title=" المزيد" subtitle="كل ما يجعل رحلتكِ الجمالية مميزة" />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Special cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              <PersonalStylingCard stylist="نورة" price={400} duration="90 دقيقة" />
              <BeautyTimeCapsuleCard savedDate="2026-08-06" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyDreamBoardCard
                dreams={[
                  { emoji: '', text: 'شعر طويل صحي' },
                  { emoji: '', text: 'إطلالة زفاف مثالية' },
                  { emoji: '', text: 'إتقان المكياج' },
                  { emoji: '', text: 'روتين عناية يومي' },
                ]}
              />
              <BeautySecretSantaCard group="عرايس الرياض" budget={200} participants={12} />
            </div>

            {/* Social */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyAccountabilityCard partner="نورة" goal="روتين عناية يومي" streak={12} />
              <BeautyGratefulCircleCard
                thanks={[
                  { from: 'نورة', to: 'مها', message: 'شكراً لنصيحة العناية بالبشرة!' },
                  { from: 'مها', to: 'ريم', message: 'أنتِ ملهمة دائماً' },
                ]}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyAffirmationCard />
              <BeautyGratitudeCard entries={15} />
            </div>

            {/* Games + Social */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyReferralLeaderboardCard
                leaders={
                  (referral?.data?.leaderboard as any[])?.map((l: any) => ({
                    name: l.name,
                    referrals: l.referrals,
                    emoji: l.emoji,
                  })) ?? [
                    { name: 'نورة', referrals: 12, emoji: '' },
                    { name: 'مها', referrals: 8 },
                    { name: 'ريم', referrals: 5 },
                  ]
                }
                userRank={referral?.data?.myRank ?? 5}
              />
              <GroupDiscountBadge
                groupSize={3}
                discount={15}
                serviceName="مانيكير سبا"
                originalPrice={150}
              />
            </div>

            {/* Lookbook + Inspiration */}
            <BeautySeasonalLookbookCard season="summer" />
            <div className="grid gap-4 sm:grid-cols-2">
              <InspirationBoardCard
                pins={[
                  { emoji: '', title: 'تسريحة ناعمة', savedBy: 'نورة' },
                  { emoji: '', title: 'مكياج السهرة', savedBy: 'مها' },
                  { emoji: '', title: 'أظافر فرنسية', savedBy: 'ريم' },
                ]}
                collaborators={['نورة', 'مها']}
              />
              <SharedWishlistCard
                items={[
                  { name: 'مانيكير سبا', price: 150, emoji: '' },
                  { name: 'مكياج احترافي', price: 350, emoji: '' },
                ]}
                sharedWith={['نورة', 'أمي']}
              />
            </div>

            <BridalBeautyCountdown weddingDate="2027-06-15" />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <BeautyVlogCard
              vlog={{
                title: 'يوم في حياة نورة',
                technician: 'نورة',
                duration: '8 دقائق',
                views: 1234,
                category: 'مكياج',
              }}
            />
            <BeautyPenPalCard match={{ city: 'جدة', interest: 'مكياج', emoji: '' }} />
            <ReferralRewardBadge referralCode="SARA123" referrals={5} discount={15} />
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
