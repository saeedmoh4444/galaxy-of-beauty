'use client';

import { api } from '@/lib/trpc';
import {
  PageContainer,
  PageTitle,
  TeenBeautyCard,
  FirstFacialCard,
  MommyAndMeCard,
  ThreeGenerationsCard,
  BrideTribeCard,
  GalentinesCard,
  PromReadyCard,
  BabyShowerCard,
  NewMomSupportCard,
  FamilyDiscountCard,
  DadApprovalBadge,
  GrandmotherPackageCard,
  BeautyBridalSkincareCard,
  BeautyBridalBodyCareCard,
  BeautyBridalEmergencyCard,
  BeautyBridalTrialCard,
  BeautyBridalGlowCard,
  BeautyFirstMakeupCard,
  BeautySchoolMakeupCard,
  BeautyTeenAcneCard,
  BeautyTeenConfidenceCard,
  BeautyDaughterMomCard,
  BeautyMaternityGlowCard,
  BeautyMaternityMassageCard,
  BeautyMaternityStyleCard,
  BeautyNursingBeautyCard,
  BeautyBabyBluesCard,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

export default function FamilyBeautyPage(): JSX.Element {
  const { t } = useLocale();
  // familyAccount.get doesn't exist — `list` is the real family data; the
  // card's members/familyName lookups fall through to defaults as before.
  const familyAccount = api.familyAccount.list.useQuery();

  return (
    <DashboardLayout userRole="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle title={t('familyBeauty.title')} subtitle={t('familyBeauty.subtitle')} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Mom + Kids */}
            <div className="grid gap-4 sm:grid-cols-2">
              <MommyAndMeCard
                mom="نورة"
                daughter="سارة"
                daughterAge={8}
                experience="mini_facial"
                totalPrice={250}
              />
              <ThreeGenerationsCard
                generations={{
                  grandma: { name: 'أم خالد', emoji: '' },
                  mom: { name: 'نورة', emoji: '' },
                  daughter: { name: 'سارة', emoji: '' },
                }}
              />
            </div>

            {/* Teens */}
            <div className="grid gap-4 sm:grid-cols-2">
              <TeenBeautyCard
                service={{
                  name: t('familyBeauty.makeupLesson'),
                  ageRange: '12-15',
                  price: 150,
                  emoji: '',
                  description: t('familyBeauty.makeupLessonDesc'),
                  learningPoints: [
                    t('familyBeauty.learning.cleanse'),
                    t('familyBeauty.learning.moisturize'),
                    t('familyBeauty.learning.lightMakeup'),
                    t('familyBeauty.learning.careTips'),
                  ],
                  parentRequired: true,
                }}
              />
              <FirstFacialCard age={14} momName="نورة" skinType="combination" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <PromReadyCard event="graduation" age={17} />
              <PromReadyCard event="eid" age={16} />
            </div>

            {/* Weddings + Events */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BrideTribeCard
                bride="سارة"
                bridesmaids={[
                  { name: 'نورة', role: t('familyBeauty.maidOfHonor') },
                  { name: 'مها', lookAssigned: true },
                  { name: 'ريم' },
                ]}
                weddingDate={t('familyBeauty.weddingDate')}
              />
              <GrandmotherPackageCard occasion="wedding" grandmaName="أم محمد" />
            </div>

            {/* Bridal Beauty */}
            <BeautyBridalSkincareCard />
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyBridalTrialCard />
              <BeautyBridalBodyCareCard />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyBridalGlowCard />
              <BeautyBridalEmergencyCard />
            </div>

            {/* Special Events */}
            <div className="grid gap-4 sm:grid-cols-2">
              <GalentinesCard
                friends={['نورة', 'مها']}
                date={t('familyBeauty.galentinesDate')}
                discount={20}
                totalPrice={450}
              />
              <BabyShowerCard momName="نورة" guests={12} />
            </div>

            {/* New Mom + Family */}
            <div className="grid gap-4 sm:grid-cols-2">
              <NewMomSupportCard babyAge={2} momName="نورة" />
              <FamilyDiscountCard
                familySize={
                  (familyAccount?.data as unknown as { members?: unknown[] })?.members?.length ?? 4
                }
                discount={20}
                familyName={
                  (familyAccount?.data as unknown as { familyName?: string })?.familyName ??
                  'آل محمد'
                }
              />
            </div>
            <DadApprovalBadge
              serviceName={t('familyBeauty.makeupLessonShort')}
              age={14}
              parentName={t('familyBeauty.dadLabel')}
            />

            {/* Teen Beauty */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyFirstMakeupCard />
              <BeautySchoolMakeupCard />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyTeenAcneCard />
              <BeautyTeenConfidenceCard />
            </div>
            <BeautyDaughterMomCard />

            {/* Maternity Beauty */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyMaternityGlowCard />
              <BeautyMaternityStyleCard />
            </div>
            <BeautyMaternityMassageCard />
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyNursingBeautyCard />
              <BeautyBabyBluesCard />
            </div>
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
