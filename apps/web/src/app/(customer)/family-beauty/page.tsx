'use client';

import { api } from '@/lib/trpc';
import {
  PageContainer, PageTitle,
  TeenBeautyCard, FirstFacialCard, MommyAndMeCard, ThreeGenerationsCard,
  BrideTribeCard, GalentinesCard, PromReadyCard, BabyShowerCard,
  NewMomSupportCard, FamilyDiscountCard, DadApprovalBadge,
  GrandmotherPackageCard,
  BeautyBridalSkincareCard, BeautyBridalBodyCareCard, BeautyBridalEmergencyCard,
  BeautyBridalTrialCard, BeautyBridalGlowCard,
  BeautyFirstMakeupCard, BeautySchoolMakeupCard, BeautyTeenAcneCard,
  BeautyTeenConfidenceCard, BeautyDaughterMomCard,
  BeautyMaternityGlowCard, BeautyMaternityMassageCard, BeautyMaternityStyleCard,
  BeautyNursingBeautyCard, BeautyBabyBluesCard,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function FamilyBeautyPage(): JSX.Element {
  const familyAccount = (api as any).familyAccount?.get?.useQuery?.() as any;
  const events = (api as any).communityEvents?.list?.useQuery?.({ limit: 2 }) as any;

  return (
    <DashboardLayout role="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle title="👨‍👩‍👧‍👦 جمال العائلة" subtitle="لحظات جميلة تجمع الأحباب" />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Mom + Kids */}
            <div className="grid gap-4 sm:grid-cols-2">
              <MommyAndMeCard mom="نورة" daughter="سارة" daughterAge={8} experience="mini_facial" totalPrice={250} />
              <ThreeGenerationsCard generations={{ grandma: { name: 'أم خالد', emoji: '👵' }, mom: { name: 'نورة', emoji: '👩' }, daughter: { name: 'سارة', emoji: '👧' } }} />
            </div>

            {/* Teens */}
            <div className="grid gap-4 sm:grid-cols-2">
              <TeenBeautyCard service={{ name: 'أول درس مكياج', ageRange: '12-15', price: 150, emoji: '💄', description: 'تعلم أساسيات المكياج بطريقة آمنة وممتعة', learningPoints: ['تنظيف البشرة', 'ترطيب', 'مكياج خفيف جداً', 'نصائح للعناية'], parentRequired: true }} />
              <FirstFacialCard age={14} momName="نورة" skinType="combination" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <PromReadyCard event="graduation" age={17} />
              <PromReadyCard event="eid" age={16} />
            </div>

            {/* Weddings + Events */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BrideTribeCard bride="سارة" bridesmaids={[{ name: 'نورة', role: 'وصيفة أولى' }, { name: 'مها', lookAssigned: true }, { name: 'ريم' }]} weddingDate="15 مارس 2027" />
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
              <GalentinesCard friends={['نورة', 'مها']} date="13 فبراير" discount={20} totalPrice={450} />
              <BabyShowerCard momName="نورة" guests={12} />
            </div>

            {/* New Mom + Family */}
            <div className="grid gap-4 sm:grid-cols-2">
              <NewMomSupportCard babyAge={2} momName="نورة" />
              <FamilyDiscountCard
              familySize={familyAccount?.data?.members?.length ?? 4}
              discount={20}
              familyName={familyAccount?.data?.familyName ?? 'آل محمد'}
            />
            </div>
            <DadApprovalBadge serviceName="درس مكياج" age={14} parentName="الأب" />

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
