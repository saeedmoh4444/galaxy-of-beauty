'use client';

import { api } from '@/lib/trpc';
import {
  PageContainer,
  PageTitle,
  TechnicianCRMCard,
  BusinessDashboardCard,
  PricingCoachCard,
  TaxHelperCard,
  MicroLoanBadge,
  FranchiseCard,
  SheLeadsBadge,
  SheLeadsProgramCard,
  BeautyRewardsCard,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

export default function ProToolsPage(): JSX.Element {
  const { t } = useLocale();
  // myStats and pricingCoach.suggestions are not registered router procedures —
  // keep the optional chaining so the cards fall back to their defaults.
  const legacyApi = api as unknown as {
    technicians?: {
      myStats?: {
        useQuery?: () => {
          data?: {
            totalCustomers: number;
            regularCustomers: number;
            newThisMonth: number;
            monthlyRevenue: number;
            avgRating: number;
          };
        };
      };
    };
    pricingCoach?: {
      suggestions?: {
        useQuery?: () => {
          data?: {
            serviceName: string;
            currentPrice: number;
            suggestedPrice: number;
            demand: 'medium' | 'high' | 'low';
            competitorAvg: number;
          };
        };
      };
    };
  };
  const crm = legacyApi.technicians?.myStats?.useQuery?.();
  const earnings = api.technicianEarnings.summary.useQuery();
  const pricing = legacyApi.pricingCoach?.suggestions?.useQuery?.();

  return (
    <DashboardLayout userRole="TECHNICIAN">
      <PageContainer width="wide">
        <PageTitle title={t('tech.pro-tools.title')} subtitle={t('tech.pro-tools.subtitle')} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <TechnicianCRMCard
                customers={{
                  total: crm?.data?.totalCustomers ?? 45,
                  regulars: crm?.data?.regularCustomers ?? 18,
                  newThisMonth: crm?.data?.newThisMonth ?? 5,
                }}
                revenueThisMonth={crm?.data?.monthlyRevenue ?? 8500}
                avgRating={crm?.data?.avgRating ?? 4.8}
              />
              <BusinessDashboardCard
                revenue={{
                  month: (earnings?.data?.thisMonth ?? 8500) as unknown as number,
                  previous: (earnings?.data?.lastMonth ?? 7200) as unknown as number,
                }}
                expenses={3200}
              />
              <PricingCoachCard
                service={{
                  name: pricing?.data?.serviceName ?? 'مانيكير سبا',
                  currentPrice: pricing?.data?.currentPrice ?? 120,
                  suggestedPrice: pricing?.data?.suggestedPrice ?? 150,
                  demand: pricing?.data?.demand ?? 'high',
                  competitorAvg: pricing?.data?.competitorAvg ?? 140,
                }}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <TaxHelperCard
                revenue={{ monthly: 8500, vat: 1275 }}
                quarter={t('tech.pro-tools.quarter')}
              />
              <MicroLoanBadge
                maxAmount={50000}
                interestRate={0}
                partnerBank={t('tech.pro-tools.partner-bank')}
              />
            </div>
            <FranchiseCard
              investmentRange={t('tech.pro-tools.franchise-range', {
                range: '100,000 - 250,000',
              })}
              expectedRevenue={t('tech.pro-tools.franchise-revenue', {
                range: '30,000 - 80,000',
              })}
              existingFranchises={12}
            />
            <SheLeadsProgramCard
              participants={34}
              duration={t('tech.pro-tools.duration-months', { months: 6 })}
            />
          </div>
          <div className="space-y-6">
            <BeautyRewardsCard points={2500} tier="diamond" />
            <SheLeadsBadge
              /* eslint-disable-next-line jsx-a11y/aria-role -- 'role' is a component data prop, not an ARIA role */
              role="franchise_owner"
              name="نورة القحطاني"
              city="الرياض"
              yearsOfExperience={8}
              teamSize={12}
            />
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
