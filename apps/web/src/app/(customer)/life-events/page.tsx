'use client';

import {
  PageContainer,
  PageTitle,
  BeautyJourneyTimeline,
  LifeEventCard,
  BridalJourneyTimeline,
  BridalBeautyCountdown,
  GoldenBeautyCard,
  CareerBeautyCard,
  PostpartumCareCard,
  CyclePhaseCard,
  TeenSkincareGuide,
  BeautyTwentiesCard,
  BeautyThirtiesCard,
  BeautyFortiesCard,
  BeautyFiftiesCard,
  BeautySixtiesCard,
  BeautyPcosSkincareCard,
  BeautyPregnancySafeCard,
  BeautyPostpartumHairCard,
  BeautyPerimenopauseCard,
  BeautyHormonalAcneCard,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

export default function LifeEventsPage(): JSX.Element {
  const { t } = useLocale();
  return (
    <DashboardLayout userRole="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle title={t('lifeEvents.title')} subtitle={t('lifeEvents.subtitle')} />

        <div className="grid gap-6 lg:grid-cols-2">
          <BeautyJourneyTimeline userAge={28} />
          <BridalJourneyTimeline weddingDate="2027-06-15" completedMonths={[6, 5]} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <BridalBeautyCountdown weddingDate="2027-06-15" />
          <LifeEventCard event="wedding" />
          <LifeEventCard event="graduation" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <LifeEventCard event="new_job" />
          <LifeEventCard event="new_mother" />
          <LifeEventCard event="hajj_umrah" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <GoldenBeautyCard age={62} />
          <CareerBeautyCard profession="office" />
          <PostpartumCareCard daysSinceBirth={15} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TeenSkincareGuide skinType="oily" age={14} />
          <CyclePhaseCard phase="follicular" day={8} />
        </div>

        {/* Skincare by Age */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
          <BeautyTwentiesCard />
          <BeautyThirtiesCard />
          <BeautyFortiesCard />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 mt-4">
          <BeautyFiftiesCard />
          <BeautySixtiesCard />
        </div>

        {/* Hormonal & Life Phases */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
          <BeautyHormonalAcneCard />
          <BeautyPcosSkincareCard />
          <BeautyPerimenopauseCard />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 mt-4">
          <BeautyPregnancySafeCard />
          <BeautyPostpartumHairCard />
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
