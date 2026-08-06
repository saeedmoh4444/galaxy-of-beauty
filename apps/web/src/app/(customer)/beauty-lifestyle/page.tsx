'use client';

import {
  PageContainer, PageTitle,
  BeautyRewardsCard, LoyaltyDividendBadge, LoyaltyAnniversaryCard,
  BeautySubscriptionCard, SubscriptionGiftCard, BeautyBudgetPlanner,
  BeautyPriceDropHistoryCard, PriceAlertBadge, StudentDiscountBadge,
  LayawayBadge, BeautySavingsMilestoneCard, TaxHelperCard,
  MicroloanBadge, BeautySavingsGoal,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function BeautyLifestylePage(): JSX.Element {
  return (
    <DashboardLayout role="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle title="💎 نمط الحياة" subtitle="الجمال جزء من أسلوب حياتكِ" />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <BeautyRewardsCard points={1250} tier="gold" />
            <div className="grid gap-4 sm:grid-cols-2">
              <LoyaltyDividendBadge yearlySpend={4500} cashbackRate={5} tier="gold" payoutMonth="يناير" />
              <LoyaltyAnniversaryCard years={2} joinedDate="أغسطس 2024" totalBookings={48} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautySubscriptionCard tier="premium" />
              <SubscriptionGiftCard friendName="مها" />
            </div>
            <BeautyBudgetPlanner monthlyIncome={8000} />
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyPriceDropHistoryCard drops={[{ service: 'مانيكير سبا', emoji: '💅', oldPrice: 150, newPrice: 99 }, { service: 'مكياج', emoji: '💄', oldPrice: 350, newPrice: 299 }]} />
              <PriceAlertBadge serviceName="مانيكير سبا" currentPrice={120} targetPrice={80} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <StudentDiscountBadge discount={15} university="جامعة الملك سعود" />
              <LayawayBadge totalPrice={600} installments={3} installmentAmount={200} remaining={1} />
              <MicroloanBadge maxAmount={50000} interestRate={0} />
            </div>
            <BeautySavingsMilestoneCard saved={1500} milestones={[500, 1000, 2000, 5000, 10000]} />
            <TaxHelperCard revenue={{ monthly: 8500, vat: 1275 }} />
            <BeautySavingsGoal goals={[{ label: 'باقة عناية', target: 500, saved: 325, monthly: 100, emoji: '🧴' }, { label: 'جهاز مكياج', target: 1200, saved: 450, monthly: 200, emoji: '💄' }]} />
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
