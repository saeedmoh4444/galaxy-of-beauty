'use client';

import { api } from '@/lib/trpc';
import {
  PageContainer, PageTitle,
  BeautyTonerCard, BeautySerumCard, BeautyMoisturizerCard,
  BeautyExfoliationCard, BeautyMaskCard, BeautySunscreenCard,
  BeautyNightRoutineCard, BeautyMorningRoutineCard, BeautyDoubleCleansingCard,
  BeautyEyeCreamCard, BeautyFaceOilCard, BeautySpotTreatmentCard,
  BeautyIceRollerCard, BeautyGuaShaCard, BeautyJadeRollerCard,
  BeautyAntiAgingCard, BeautyPregnancySkincareCard, BeautyMenopauseSkincareCard,
  BeautyAcneGuideCard, BeautyHyperpigmentationCard, BeautyRosaceaCard,
  BeautySkinBarrierCard, BeautySkinCycleCard, BeautySkinFastingCard,
  BeautySelfMassageCard, BeautyRoutineTimelineCard,
  BeautySkincareMistCard, BeautySkincareOilCard, BeautySkincareRetinolCard,
  BeautySkincareAcidCard, BeautySkincarePeptideCard,
  BeautySkincareAzelaicCard, BeautySkincareCeramideCard, BeautySkincareHyaluronicCard,
  BeautySkincareNiacinamideCard, BeautySkincareVitaminCCard,
  BeautySkinQuizCard,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function SkincareGuidePage(): JSX.Element {
  const skinAnalysis = (api as any).skinAnalysis?.latest?.useQuery?.() as any;

  return (
    <DashboardLayout role="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle title="🧴 دليل العناية بالبشرة" subtitle="كل ما تحتاجينه لبشرة صحية ومشرقة" />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Routines */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyMorningRoutineCard />
              <BeautyNightRoutineCard />
            </div>
            <BeautyDoubleCleansingCard />
            <BeautyRoutineTimelineCard
              morning={['غسول', 'تونر', 'سيروم فيتامين سي', 'مرطب', 'واقي شمس']}
              evening={['مزيل مكياج', 'غسول', 'تونر', 'سيروم ليلي', 'مرطب']}
              skinType="مختلطة"
            />

            {/* Product guides */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyTonerCard />
              <BeautySerumCard />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyMoisturizerCard />
              <BeautySunscreenCard />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyExfoliationCard />
              <BeautyMaskCard />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyEyeCreamCard />
              <BeautyFaceOilCard />
            </div>

            {/* Active Ingredients */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautySkincareVitaminCCard />
              <BeautySkincareRetinolCard />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautySkincareHyaluronicCard />
              <BeautySkincareNiacinamideCard />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautySkincareAzelaicCard />
              <BeautySkincareCeramideCard />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautySkincarePeptideCard />
              <BeautySkincareAcidCard />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautySkincareMistCard />
              <BeautySkincareOilCard />
            </div>

            {/* Skin Quiz */}
            <BeautySkinQuizCard />

            {/* Tools */}
            <div className="grid gap-4 sm:grid-cols-3">
              <BeautyIceRollerCard />
              <BeautyGuaShaCard />
              <BeautyJadeRollerCard />
            </div>

            {/* Advanced */}
            <BeautySkinCycleCard />
            <BeautySkinBarrierCard />
            <BeautySkinFastingCard />

            {/* Skin conditions */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyAcneGuideCard />
              <BeautyHyperpigmentationCard />
            </div>
            <BeautyRosaceaCard />
            <BeautySpotTreatmentCard />

            {/* Life stages */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyPregnancySkincareCard />
              <BeautyMenopauseSkincareCard />
            </div>
            <BeautyAntiAgingCard />
            <BeautySelfMassageCard />
          </div>

          <div className="space-y-6">
            <BeautyPerfumeCard />
            <BeautyHairCareCard hairType="curly" />
            <BeautyNailCareCard />
            <BeautyLipsCareCard />
            <BeautyHandsCareCard />
            <BeautyFootCareCard />
            <BeautyTeethCareCard />
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
