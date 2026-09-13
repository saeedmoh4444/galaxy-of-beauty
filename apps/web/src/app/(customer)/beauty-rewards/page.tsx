'use client';

import {
  PageContainer,
  PageTitle,
  BeautyRewardsCard,
  LoyaltyDividendBadge,
  LoyaltyAnniversaryCard,
  HandwrittenNote,
  BirthdayMonthBadge,
  RandomActOfBeauty,
  JustBecauseFlowers,
  ReferralRewardBadge,
  BeautyReferralLeaderboardCard,
  GroupDiscountBadge,
  StudentDiscountBadge,
  KindnessPointsBadge,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

export default function BeautyRewardsPage(): JSX.Element {
  const { t } = useLocale();
  return (
    <DashboardLayout userRole="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle title={t('beautyRewards.title')} subtitle={t('beautyRewards.subtitle')} />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <BeautyRewardsCard points={1250} tier="gold" />
            <div className="grid gap-4 sm:grid-cols-2">
              <LoyaltyDividendBadge yearlySpend={4500} cashbackRate={5} tier="gold" />
              <LoyaltyAnniversaryCard
                years={2}
                joinedDate={t('beautyLifestyle.august2024')}
                totalBookings={48}
              />
            </div>
            <BeautyReferralLeaderboardCard
              leaders={[
                { name: 'نورة', referrals: 12 },
                { name: 'مها', referrals: 8 },
                { name: 'ريم', referrals: 5 },
              ]}
              userRank={5}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <ReferralRewardBadge referralCode="SARA123" referrals={5} discount={15} />
              <GroupDiscountBadge
                groupSize={3}
                discount={15}
                serviceName={t('beautyBudget.spaManicure')}
                originalPrice={150}
              />
            </div>
            <StudentDiscountBadge discount={15} university={t('beautyLifestyle.ksu')} />
            <KindnessPointsBadge points={340} />
          </div>
          <div className="space-y-6">
            <HandwrittenNote bookingCount={10} technicianName="نورة" />
            <BirthdayMonthBadge month={t('beautyEvents.march')} discount={15} daysRemaining={22} />
            <RandomActOfBeauty />
            <JustBecauseFlowers bookingsCount={15} />
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
