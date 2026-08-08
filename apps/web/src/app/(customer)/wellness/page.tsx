'use client';

import { api } from '@/lib/trpc';
import {
  PageContainer, PageTitle,
  CyclePhaseCard, SelfCareReminder, MentalWellnessCard, PregnancySafeBadge,
  SkinAnalysisCard, HydrationTracker, BeautySleepCard, WellnessCheckCard,
  FitnessBeautyCard, CycleResourceCard, BeautyMoodTrackerCard, AllergyTestCard,
  BreastHealthCard, AllergySafeBadge,
  BeautySmileCard, BeautyGlowCard, BeautyConfidenceCard,
  BeautySleepHygieneCard, BeautyNutritionCard, BeautyExerciseCard,
  BeautyStretchCard, BeautyBreathingCard, BeautyMeditationCard,
  BeautyRelaxationCard, BeautyWellnessCornerCard, BeautyWaterIntakeCard,
  BeautyPostureCard, BeautySuncareReminderCard, BeautyDailyCheckInCard,
  BeautyRamadanBeautyCard, BeautyPostWorkoutCard, BeautyTravelKitCard,
  BeautyCapsuleWardrobeCard, BeautyBedtimeRitualCard,
  BeautyCollagenCard, BeautyBiotinCard, BeautyGlutathioneCard,
  BeautyOmegaCard, BeautyProbioticCard,
  BeautyGreenTeaCard, BeautyMatchaCard, BeautyTurmericLatteCard,
  BeautyChlorophyllCard, BeautyBeetrootCard,
  BeautyFaceYogaCard, BeautyBarreCard, BeautySweatProofCard,
  BeautyPostWorkoutHairCard, BeautyFitnessGlowCard,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function WellnessPage(): JSX.Element {
  const cycleSettings = (api as any).cycleTracker?.settings?.useQuery?.() as any;
  const skinAnalysis = (api as any).skinAnalysis?.latest?.useQuery?.() as any;
  const wellnessCheck = (api as any).wellnessTracker?.latest?.useQuery?.() as any;
  const sleepLogs = (api as any).sleepTracker?.stats?.useQuery?.() as any;

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
              <SkinAnalysisCard concerns={(skinAnalysis?.data?.concerns as string[]) ?? ['dryness', 'dark_spots']} />
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
            <BeautyWaterIntakeCard goal={8} />
            <BeautySuncareReminderCard spf={50} />
            <BeautyDailyCheckInCard />
          </div>
        </div>

        {/* Wellness Lifestyle Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6">
            <BeautySmileCard />
            <BeautyGlowCard />
            <BeautyConfidenceCard />
          </div>
          <div className="space-y-6">
            <BeautySleepHygieneCard />
            <BeautyNutritionCard />
            <BeautyExerciseCard />
          </div>
          <div className="space-y-6">
            <BeautyStretchCard />
            <BeautyBreathingCard />
            <BeautyPostureCard />
          </div>
        </div>

        {/* Mindfulness Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <BeautyMeditationCard />
          <BeautyRelaxationCard />
          <BeautyWellnessCornerCard />
        </div>

        {/* Lifestyle & Rituals */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <BeautyRamadanBeautyCard />
          <BeautyPostWorkoutCard />
          <BeautyBedtimeRitualCard />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <BeautyTravelKitCard />
          <BeautyCapsuleWardrobeCard />
        </div>

        {/* Inner Beauty / Supplements */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <BeautyCollagenCard />
          <BeautyBiotinCard />
          <BeautyGlutathioneCard />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <BeautyOmegaCard />
          <BeautyProbioticCard />
        </div>

        {/* Beauty Drinks */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <BeautyGreenTeaCard />
          <BeautyMatchaCard />
          <BeautyTurmericLatteCard />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <BeautyChlorophyllCard />
          <BeautyBeetrootCard />
        </div>

        {/* Fitness & Training */}
        <BeautyFaceYogaCard />
        <div className="grid gap-4 sm:grid-cols-2">
          <BeautyBarreCard />
          <BeautyFitnessGlowCard />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <BeautySweatProofCard />
          <BeautyPostWorkoutHairCard />
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
