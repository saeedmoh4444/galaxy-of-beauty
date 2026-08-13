'use client';

import { api } from '@/lib/trpc';
import {
  PageContainer,
  PageTitle,
  SheLeadsBadge,
  SocialImpactCounter,
  FranchiseCard,
  AnnualSummitCard,
  RuralOutreachCard,
  DVSupportBadge,
  BeautyBankCard,
  Vision2030Badge,
  WomenEmployerBadge,
  MediaFeatureCard,
  PressKitCard,
  ExportProgramCard,
  InvestorPitchCard,
  StartupMentorshipCard,
  CharityPartnerBadge,
  BeautyAwardBadgeCard,
  AlumniNetworkCard,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function LeadershipPage(): JSX.Element {
  const socialImpact = (api as any).socialImpact?.stats?.useQuery?.() as any;

  return (
    <DashboardLayout userRole="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle
          title=" القيادة والأثر"
          subtitle="معاً نبني مستقبل المرأة السعودية في التجميل"
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <SocialImpactCounter
              womenEmployed={socialImpact?.data?.womenEmployed ?? 847}
              womenInTraining={socialImpact?.data?.womenInTraining ?? 234}
              survivorServices={socialImpact?.data?.survivorServices ?? 156}
              ruralWomen={socialImpact?.data?.ruralWomen ?? 89}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <SheLeadsBadge
                /* eslint-disable-next-line jsx-a11y/aria-role -- 'role' is a component data prop, not an ARIA role */
                role="franchise_owner"
                name="نورة القحطاني"
                city="الرياض"
                yearsOfExperience={8}
                teamSize={12}
              />
              <SheLeadsBadge
                /* eslint-disable-next-line jsx-a11y/aria-role -- 'role' is a component data prop, not an ARIA role */
                role="academy_instructor"
                name="د. سارة"
                city="جدة"
                yearsOfExperience={15}
              />
            </div>

            <FranchiseCard
              investmentRange="100,000 - 250,000 ر.س"
              expectedRevenue="30,000 - 80,000 ر.س"
              existingFranchises={12}
            />
            <AnnualSummitCard
              year={2027}
              city="الرياض"
              date="8-9 مارس"
              attendees={450}
              earlyBirdPrice={499}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <RuralOutreachCard trained={87} employed={52} villages={14} target={200} />
              <Vision2030Badge womenEmployed={847} target={1000} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyBankCard funded={127} goal={200} waitlist={23} />
              <CharityPartnerBadge
                charity={{
                  name: 'جمعية حماية الأسرة',
                  cause: 'دعم الناجيات من العنف الأسري',
                  emoji: '',
                }}
                raised={45000}
              />
            </div>

            <DVSupportBadge partnerShelter="جمعية حماية الأسرة" survivorsServed={47} />

            <div className="grid gap-4 sm:grid-cols-3">
              <WomenEmployerBadge
                womenEmployed={8}
                totalStaff={10}
                hasBenefits={true}
                womenInManagement={3}
              />
              <WomenEmployerBadge
                womenEmployed={12}
                totalStaff={15}
                hasBenefits={true}
                womenInManagement={5}
              />
              <WomenEmployerBadge womenEmployed={4} totalStaff={5} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ExportProgramCard products={12} countries={5} />
              <InvestorPitchCard startups={15} funded={8} totalRaised="٢ مليون" />
            </div>

            <StartupMentorshipCard mentors={12} startups={8} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <BeautyAwardBadgeCard
              awards={[
                {
                  name: 'أفضل منصة تجميل نسائية',
                  year: '2026',
                  emoji: '',
                  description: 'ملتقى المرأة في الجمال',
                },
                { name: 'أفضل مبادرة تمكين', year: '2025', emoji: '' },
              ]}
            />
            <AlumniNetworkCard graduates={234} />
            <MediaFeatureCard
              feature={{
                outlet: 'العربية',
                title: 'منصة سعودية تمكّن 1000 امرأة في قطاع التجميل',
                date: '2026-07',
                type: 'tv',
              }}
            />
            <PressKitCard />
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
