'use client';

import {
  PageContainer, PageTitle,
  BeautyJourneyTimeline, LifeEventCard, BridalJourneyTimeline, BridalBeautyCountdown,
  GoldenBeautyCard, CareerBeautyCard, PostpartumCareCard,
  CyclePhaseCard, TeenSkincareGuide,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function LifeEventsPage(): JSX.Element {
  return (
    <DashboardLayout role="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle title="🌸 مراحل الحياة" subtitle="لكل مرحلة عمرية جمالها الخاص" />

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
      </PageContainer>
    </DashboardLayout>
  );
}
