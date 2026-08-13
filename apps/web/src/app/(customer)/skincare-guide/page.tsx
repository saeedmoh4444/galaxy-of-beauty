'use client';

import {
  PageContainer,
  PageTitle,
  BeautyTonerCard,
  BeautySerumCard,
  BeautyMoisturizerCard,
  BeautyExfoliationCard,
  BeautyMaskCard,
  BeautySunscreenCard,
  BeautyNightRoutineCard,
  BeautyMorningRoutineCard,
  BeautyDoubleCleansingCard,
  BeautyEyeCreamCard,
  BeautyFaceOilCard,
  BeautySpotTreatmentCard,
  BeautyIceRollerCard,
  BeautyGuaShaCard,
  BeautyJadeRollerCard,
  BeautyAntiAgingCard,
  BeautyPregnancySkincareCard,
  BeautyMenopauseSkincareCard,
  BeautyAcneGuideCard,
  BeautyHyperpigmentationCard,
  BeautyRosaceaCard,
  BeautySkinBarrierCard,
  BeautySkinCycleCard,
  BeautySkinFastingCard,
  BeautySelfMassageCard,
  BeautyRoutineTimelineCard,
  BeautySkincareMistCard,
  BeautySkincareOilCard,
  BeautySkincareRetinolCard,
  BeautySkincareAcidCard,
  BeautySkincarePeptideCard,
  BeautySkincareAzelaicCard,
  BeautySkincareCeramideCard,
  BeautySkincareHyaluronicCard,
  BeautySkincareNiacinamideCard,
  BeautySkincareVitaminCCard,
  BeautySkinQuizCard,
  BeautyGlassSkinCard,
  BeautySheetMaskCard,
  BeautyEssenceCard,
  BeautySnailMucinCard,
  BeautyCentellaCard,
  BeautyChemicalPeelCard,
  BeautyMicroneedlingCard,
  BeautyHydrofacialCard,
  BeautyBakuchiolCard,
  BeautyIngredientMixingCard,
  BeautyOxygenFacialCard,
  BeautyDiamondFacialCard,
  BeautyGoldFacialCard,
  BeautyVampireFacialCard,
  BeautyCaviarFacialCard,
  BeautyDarkCirclesCard,
  BeautyEyeBagsCard,
  BeautyCrowsFeetCard,
  BeautyEyeMassageCard,
  BeautyEyeSerumCard,
  BeautyAcneScarsCard,
  BeautyPieScarsCard,
  BeautyPoreRefiningCard,
  BeautyPostAcneMarksCard,
  BeautyScarTreatmentCard,
  BeautyMaskneCard,
  BeautyKoreanRoutineCard,
  BeautyJapaneseRoutineCard,
  BeautyPerfumeCard,
  BeautyHairCareCard,
  BeautyNailCareCard,
  BeautyLipsCareCard,
  BeautyHandsCareCard,
  BeautyFootCareCard,
  BeautyTeethCareCard,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function SkincareGuidePage(): JSX.Element {
  return (
    <DashboardLayout userRole="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle title=" دليل العناية بالبشرة" subtitle="كل ما تحتاجينه لبشرة صحية ومشرقة" />

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

            {/* Eye Area */}
            <BeautyDarkCirclesCard />
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyEyeBagsCard />
              <BeautyCrowsFeetCard />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyEyeSerumCard />
              <BeautyEyeMassageCard />
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

            {/* K-Beauty */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyGlassSkinCard />
              <BeautySheetMaskCard />
            </div>
            <BeautyEssenceCard />
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautySnailMucinCard />
              <BeautyCentellaCard />
            </div>

            {/* Professional Treatments */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyChemicalPeelCard />
              <BeautyMicroneedlingCard />
            </div>
            <BeautyHydrofacialCard />
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyBakuchiolCard />
              <BeautyIngredientMixingCard />
            </div>

            {/* Professional Facials */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyOxygenFacialCard />
              <BeautyDiamondFacialCard />
            </div>
            <BeautyGoldFacialCard />
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyVampireFacialCard />
              <BeautyCaviarFacialCard />
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

            {/* Acne Scars & Marks */}
            <BeautyAcneScarsCard />
            <BeautyPieScarsCard />
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyPoreRefiningCard />
              <BeautyPostAcneMarksCard />
            </div>
            <BeautyScarTreatmentCard />
            <BeautyMaskneCard />

            {/* K/J-Beauty Routines */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyKoreanRoutineCard />
              <BeautyJapaneseRoutineCard />
            </div>

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
