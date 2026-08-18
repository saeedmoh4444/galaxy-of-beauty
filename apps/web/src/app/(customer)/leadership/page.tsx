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
import { useLocale } from '@/components/LocaleProvider';

export default function LeadershipPage(): JSX.Element {
  const { t } = useLocale();
  const socialImpact = api.socialImpact.stats.useQuery();

  return (
    <DashboardLayout userRole="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle title={t('leadership.title')} subtitle={t('leadership.subtitle')} />

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
                name={t('leadership.name.noura')}
                city={t('leadership.city.riyadh')}
                yearsOfExperience={8}
                teamSize={12}
              />
              <SheLeadsBadge
                /* eslint-disable-next-line jsx-a11y/aria-role -- 'role' is a component data prop, not an ARIA role */
                role="academy_instructor"
                name={t('leadership.name.sarah')}
                city={t('leadership.city.jeddah')}
                yearsOfExperience={15}
              />
            </div>

            <FranchiseCard
              investmentRange={t('leadership.franchise.investment')}
              expectedRevenue={t('leadership.franchise.revenue')}
              existingFranchises={12}
            />
            <AnnualSummitCard
              year={2027}
              city={t('leadership.city.riyadh')}
              date={t('leadership.summit.date')}
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
                  name: t('leadership.charity.name'),
                  cause: t('leadership.charity.cause'),
                  emoji: '',
                }}
                raised={45000}
              />
            </div>

            <DVSupportBadge partnerShelter={t('leadership.charity.name')} survivorsServed={47} />

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
              <InvestorPitchCard
                startups={15}
                funded={8}
                totalRaised={t('leadership.pitch.raised')}
              />
            </div>

            <StartupMentorshipCard mentors={12} startups={8} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <BeautyAwardBadgeCard
              awards={[
                {
                  name: t('leadership.award.platform'),
                  year: '2026',
                  emoji: '',
                  description: t('leadership.award.description'),
                },
                { name: t('leadership.award.initiative'), year: '2025', emoji: '' },
              ]}
            />
            <AlumniNetworkCard graduates={234} />
            <MediaFeatureCard
              feature={{
                outlet: t('leadership.media.outlet'),
                title: t('leadership.media.title'),
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
