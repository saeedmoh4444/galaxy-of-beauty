'use client';

import { api } from '@/lib/trpc';
import {
  PageContainer, PageTitle,
  CyclePhaseCard, SelfCareReminder, MentalWellnessCard, PregnancySafeBadge,
  SkinAnalysisCard, HydrationTracker, BeautySleepCard, WellnessCheckCard,
  FitnessBeautyCard, CycleResourceCard, BeautyMoodTrackerCard, AllergyTestCard,
  BreastHealthCard, AllergySafeBadge,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function WellnessPage(): JSX.Element {
  const cycleSettings = (api as any).cycleTracker?.settings?.useQuery?.() as any;

  return (
    <DashboardLayout role="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle title="🌿 الصحة والعافية" subtitle="جمالكِ يبدأ من صحتكِ" />

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <SelfCareReminder />
              <MentalWellnessCard mood="stressed" />
            </div>

            <CyclePhaseCard
              phase={cycleSettings?.data?.currentPhase ?? 'follicular'}
              day={cycleSettings?.data?.cycleDay ?? 14}
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <HydrationTracker goal={8} current={3} />
              <BeautySleepCard bedtime="22:30" wakeTime="06:30" />
              <WellnessCheckCard />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <SkinAnalysisCard concerns={['dryness', 'dark_spots']} />
              <CycleResourceCard phase="follicular" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FitnessBeautyCard workoutType="gym" />
              <BeautyMoodTrackerCard />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <PregnancySafeBadge trimester={2} />
            <AllergyTestCard lastTest="2026-07" />
            <AllergySafeBadge allergies={['fragrance', 'paraben']} />
            <BreastHealthCard lastExam="2026-07" />
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
