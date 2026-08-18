'use client';

import {
  PageContainer,
  PageTitle,
  BeautyHairMaskCard,
  BeautyHairOilCard,
  BeautyHairWashCard,
  BeautyHairBrushCard,
  BeautyHairHeatCard,
  BeautyHairColorCard,
  BeautyHairCurlCard,
  BeautyHairStraightCard,
  BeautyHairWavyCard,
  BeautyHairCoilyCard,
  BeautyHairDandruffCard,
  BeautyHairLossCard,
  BeautyHairGrowthCard,
  BeautyHairTrimCard,
  BeautyHairScalpCard,
  BeautyHairBrideCard,
  BeautyHairSummerCard,
  BeautyHairWinterCard,
  BeautyHairHijabCard,
  BeautyBalayageCard,
  BeautyHairGlossCard,
  BeautyHairBondRepairCard,
  BeautyHeatlessCurlsCard,
  BeautyHairThinningCard,
  BeautyPerfumeCard,
  BeautySkincareMistCard,
  BeautyNailCareCard,
  BeautyLipsCareCard,
  BeautyHandsCareCard,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

export default function HairCareGuidePage(): JSX.Element {
  const { t } = useLocale();
  return (
    <DashboardLayout userRole="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle title={'‍️' + t('hairCareGuide.title')} subtitle={t('hairCareGuide.subtitle')} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Hair Care Basics */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyHairWashCard />
              <BeautyHairMaskCard />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyHairOilCard />
              <BeautyHairBrushCard />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyHairHeatCard />
              <BeautyHairColorCard />
            </div>
            <BeautyHairScalpCard />
            <BeautyHairTrimCard />

            {/* Hair Types */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyHairCurlCard />
              <BeautyHairStraightCard />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyHairWavyCard />
              <BeautyHairCoilyCard />
            </div>

            {/* Concerns */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyHairDandruffCard />
              <BeautyHairLossCard />
            </div>
            <BeautyHairGrowthCard />

            {/* Special Occasions */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyHairBrideCard />
              <BeautyHairHijabCard />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyHairSummerCard />
              <BeautyHairWinterCard />
            </div>

            {/* Techniques & Treatments */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyBalayageCard />
              <BeautyHairGlossCard />
            </div>
            <BeautyHairBondRepairCard />
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyHeatlessCurlsCard />
              <BeautyHairThinningCard />
            </div>
          </div>

          <div className="space-y-6">
            <BeautyPerfumeCard />
            <BeautySkincareMistCard />
            <BeautyNailCareCard />
            <BeautyLipsCareCard />
            <BeautyHandsCareCard />
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
