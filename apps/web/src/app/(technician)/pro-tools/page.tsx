'use client';

import {
  PageContainer, PageTitle,
  TechnicianCRMCard, BusinessDashboardCard, PricingCoachCard,
  TaxHelperCard, MicroloanBadge, FranchiseCard,
  SheLeadsBadge, SheLeadsProgramCard, BeautyRewardsCard,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function ProToolsPage(): JSX.Element {
  return (
    <DashboardLayout role="TECHNICIAN">
      <PageContainer width="wide">
        <PageTitle title="💼 أدوات المحترفات" subtitle="أدوات احترافية لإدارة أعمالكِ" />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <TechnicianCRMCard customers={{ total: 45, regulars: 18, newThisMonth: 5 }} revenueThisMonth={8500} avgRating={4.8} />
              <BusinessDashboardCard revenue={{ month: 8500, previous: 7200 }} expenses={3200} />
              <PricingCoachCard service={{ name: 'مانيكير سبا', currentPrice: 120, suggestedPrice: 150, demand: 'high', competitorAvg: 140 }} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <TaxHelperCard revenue={{ monthly: 8500, vat: 1275 }} quarter="الربع الثالث" />
              <MicroloanBadge maxAmount={50000} interestRate={0} partnerBank="بنك التنمية الاجتماعية" />
            </div>
            <FranchiseCard investmentRange="100,000 - 250,000 ر.س" expectedRevenue="30,000 - 80,000 ر.س" existingFranchises={12} />
            <SheLeadsProgramCard participants={34} duration="6 أشهر" />
          </div>
          <div className="space-y-6">
            <BeautyRewardsCard points={2500} tier="diamond" />
            <SheLeadsBadge role="franchise_owner" name="نورة القحطاني" city="الرياض" yearsOfExperience={8} teamSize={12} />
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
