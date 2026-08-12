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

export default function BeautyServicesPage(): JSX.Element {
  const services = (api as any).services?.list?.useQuery?.({ limit: 10 }) as any;
  const loyalty = (api as any).loyalty?.getAccount?.useQuery?.() as any;
  const pricing = (api as any).pricingCoach?.suggestions?.useQuery?.() as any;

  return (
    <DashboardLayout role="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle title="💅 خدمات الجمال" subtitle="اكتشفي كل ما تحتاجينه" />

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
                nextPrayer={{ name: 'العصر', time: '45 دقيقة' }}
              />
              <BeautyComparisonCard
                items={[
                  {
                    name: 'كريم A',
                    emoji: '🧴',
                    price: 120,
                    rating: 4.5,
                    pros: ['ترطيب عميق', 'يدوم 24 ساعة'],
                    cons: ['ثقيل قليلاً'],
                    best: true,
                  },
                  {
                    name: 'كريم B',
                    emoji: '🧴',
                    price: 80,
                    rating: 4.0,
                    pros: ['خفيف', 'سريع الامتصاص'],
                    cons: ['ترطيب أقل'],
                  },
                ]}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyPriceDropHistoryCard
                drops={[
                  {
                    service: 'مانيكير سبا',
                    emoji: '💅',
                    oldPrice: 150,
                    newPrice: 99,
                    date: '2026-08-01',
                  },
                  {
                    service: 'مكياج احترافي',
                    emoji: '💄',
                    oldPrice: 350,
                    newPrice: 299,
                    date: '2026-07-28',
                  },
                ]}
              />
              <BookingSummary
                booking={{
                  code: 'GOB-1234',
                  service: 'مانيكير سبا',
                  technician: 'نورة',
                  date: '15 أغسطس 2026',
                  time: '10:00',
                  status: 'confirmed',
                  price: 99,
                }}
              />
            </div>

            <BeautyRewardsCard
              points={loyalty?.data?.points ?? 1250}
              tier={(loyalty?.data?.tier?.toLowerCase() as any) ?? 'gold'}
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
                  name: 'مانيكير سبا',
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
                partnerBank="بنك التنمية الاجتماعية"
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
              serviceName="مانيكير سبا"
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
