'use client';

import { api } from '@/lib/trpc';
import {
  PageContainer,
  PageTitle,
  BeautyTip,
  BeautyEmergency,
  PeriodFriendlyBadge,
  SalonAmenities,
  PrayerRoomBadge,
  BeautyComparisonCard,
  BeautySubscriptionCard,
  BookingSummary,
  BeautyPriceDropHistoryCard,
  BeautyRewardsCard,
  MicroLoanBadge,
  PricingCoachCard,
  TechnicianCRMCard,
  BusinessDashboardCard,
  LoyaltyDividendBadge,
  PriceAlertBadge,
  LayawayBadge,
  SubscriptionGiftCard,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

export default function BeautyServicesPage(): JSX.Element {
  const { t } = useLocale();
  const loyalty = api.loyalty.myAccount.useQuery();

  return (
    <DashboardLayout userRole="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle title={t('beautyServices.title')} subtitle={t('beautyServices.subtitle')} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <BeautyTip />
              <BeautyEmergency onBook={() => {}} />
              <PeriodFriendlyBadge />
            </div>

            <SalonAmenities
              amenities={[
                'wifi',
                'parking',
                'coffee',
                'waiting_area',
                'private_room',
                'kids_corner',
              ]}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <PrayerRoomBadge
                amenities={['prayer_mats', 'abayas', 'qibla', 'wudu_area']}
                nextPrayer={{
                  name: t('beautyReminders.asr'),
                  time: t('beautyServices.prayerIn45'),
                }}
              />
              <BeautyComparisonCard
                items={[
                  {
                    name: t('beautyServices.creamA'),
                    emoji: '',
                    price: 120,
                    rating: 4.5,
                    pros: [t('beautyServices.prosDeepHydration'), t('beautyServices.prosLasts24h')],
                    cons: [t('beautyServices.consSlightlyHeavy')],
                    best: true,
                  },
                  {
                    name: t('beautyServices.creamB'),
                    emoji: '',
                    price: 80,
                    rating: 4.0,
                    pros: [t('beautyServices.prosLight'), t('beautyServices.prosFastAbsorb')],
                    cons: [t('beautyServices.consLessHydrating')],
                  },
                ]}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyPriceDropHistoryCard
                drops={[
                  {
                    service: t('beautyBudget.spaManicure'),
                    emoji: '',
                    oldPrice: 150,
                    newPrice: 99,
                    date: '2026-08-01',
                  },
                  {
                    service: t('beautyCourses.path.title'),
                    emoji: '',
                    oldPrice: 350,
                    newPrice: 299,
                    date: '2026-07-28',
                  },
                ]}
              />
              <BookingSummary
                booking={{
                  code: 'GOB-1234',
                  service: t('beautyBudget.spaManicure'),
                  technician: 'نورة',
                  date: t('beautyServices.bookingDate'),
                  time: '10:00',
                  status: 'confirmed',
                  price: 99,
                }}
              />
            </div>

            <BeautyRewardsCard
              points={loyalty?.data?.points ?? 1250}
              tier={(loyalty?.data?.tier?.toLowerCase() as 'silver' | 'gold' | 'diamond') ?? 'gold'}
            />

            {/* Technician tools */}
            <div className="grid gap-4 sm:grid-cols-3">
              <TechnicianCRMCard
                customers={{ total: 45, regulars: 18, newThisMonth: 5 }}
                revenueThisMonth={8500}
                avgRating={4.8}
              />
              <BusinessDashboardCard revenue={{ month: 8500, previous: 7200 }} expenses={3200} />
              <PricingCoachCard
                service={{
                  name: t('beautyBudget.spaManicure'),
                  currentPrice: 120,
                  suggestedPrice: 150,
                  demand: 'high',
                  competitorAvg: 140,
                }}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <MicroLoanBadge
                maxAmount={50000}
                interestRate={0}
                partnerBank={t('beautyServices.sdb')}
              />
              <SubscriptionGiftCard friendName="مها" />
              <LayawayBadge
                totalPrice={600}
                installments={3}
                installmentAmount={200}
                remaining={2}
              />
            </div>
          </div>

          <div className="space-y-6">
            <BeautySubscriptionCard tier="premium" />
            <LoyaltyDividendBadge yearlySpend={4500} cashbackRate={5} tier="gold" />
            <PriceAlertBadge
              serviceName={t('beautyBudget.spaManicure')}
              currentPrice={120}
              targetPrice={80}
              isActive={false}
            />
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
