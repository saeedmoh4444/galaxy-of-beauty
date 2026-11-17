'use client';
import type { JSX } from 'react';

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
  BeautyRewardsCard,
  ErrorAlert,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

/** Saudi VAT rate — the tax card computes the real liability from revenue. */
const VAT_RATE = 0.15;

/**
 * W4-1 — the pro-tools page used to render FABRICATED financials to real
 * technicians (45 customers, SAR 8,500 revenue, 4.8★, expenses 3,200,
 * 2,500 points, a fake persona badge — via procedures that never existed).
 * Every figure below now comes from real data: technicianPerformance.myStats
 * (bookings-derived), technicianEarnings.summary (payouts), the dynamic
 * pricing engine, and loyalty.myAccount. Program cards keep marketing copy
 * only; no invented personal stats remain.
 */
export default function ProToolsPage(): JSX.Element {
  const { t } = useLocale();
  const crm = api.technicianPerformance.myStats.useQuery();
  const earnings = api.technicianEarnings.summary.useQuery();
  const pricing = api.technicianPerformance.pricingSuggestion.useQuery();
  const loyalty = api.loyalty.myAccount.useQuery();
  const me = api.users.getMe.useQuery();

  if (earnings.isError) {
    return <ErrorAlert message={t('state.error')} onRetry={() => earnings.refetch()} />;
  }

  const thisMonth = earnings.data?.thisMonth ?? 0;
  const vat = Math.round(thisMonth * VAT_RATE * 100) / 100;
  const rewardTier =
    loyalty.data?.tier === 'PLATINUM'
      ? 'diamond'
      : loyalty.data?.tier === 'GOLD'
        ? 'gold'
        : 'silver';

  return (
    <DashboardLayout userRole="TECHNICIAN">
      <PageContainer width="wide">
        <PageTitle title={t('tech.pro-tools.title')} subtitle={t('tech.pro-tools.subtitle')} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <TechnicianCRMCard
                customers={{
                  total: crm.data?.totalCustomers ?? 0,
                  regulars: crm.data?.regularCustomers ?? 0,
                  newThisMonth: crm.data?.newThisMonth ?? 0,
                }}
                revenueThisMonth={crm.data?.monthlyRevenue ?? 0}
                avgRating={crm.data?.avgRating ?? 0}
              />
              <BusinessDashboardCard
                revenue={{
                  month: thisMonth,
                  previous: earnings.data?.lastMonth ?? 0,
                }}
                // The platform fee IS the real expense line (no separate
                // expense tracking exists yet — fail closed, never invent).
                expenses={earnings.data?.feesThisMonth ?? 0}
              />
              {pricing.data ? (
                <PricingCoachCard
                  service={{
                    name: pricing.data.serviceName,
                    currentPrice: pricing.data.currentPrice,
                    suggestedPrice: pricing.data.suggestedPrice,
                    demand: pricing.data.demand,
                  }}
                />
              ) : null}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <TaxHelperCard
                revenue={{ monthly: thisMonth, vat }}
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
            />
          </div>
          <div className="space-y-6">
            <BeautyRewardsCard points={loyalty.data?.points ?? 0} tier={rewardTier} />
            {me.data ? (
              <SheLeadsBadge
                /* eslint-disable-next-line jsx-a11y/aria-role -- 'role' is a component data prop, not an ARIA role */
                role="master_technician"
                name={me.data.name}
                city={crm.data?.city}
                yearsOfExperience={crm.data?.yearsOfExperience ?? 0}
              />
            ) : null}
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
