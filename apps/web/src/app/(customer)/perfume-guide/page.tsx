'use client';

import {
  PageContainer,
  PageTitle,
  BeautyPerfumeLayerCard,
  BeautyPerfumeSeasonCard,
  BeautyPerfumeOudCard,
  BeautyPerfumeMuskCard,
  BeautyPerfumeRoseCard,
  BeautyPerfumeAmberCard,
  BeautyPerfumeSaffronCard,
  BeautyPerfumeMixingCard,
  BeautyPerfumeStorageCard,
  BeautyPerfumeOccasionCard,
  BeautySkincareMistCard,
  BeautyHairCareCard,
  BeautyNailCareCard,
  BeautyLipsCareCard,
  BeautyJewelryCard,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function PerfumeGuidePage(): JSX.Element {
  return (
    <DashboardLayout userRole="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle
          title=" دليل العطور"
          subtitle="كل ما تحتاجينه عن عالم العطور الشرقية والغربية"
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <BeautyPerfumeLayerCard />
            <BeautyPerfumeMixingCard />

            {/* Perfume Notes */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyPerfumeOudCard />
              <BeautyPerfumeMuskCard />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyPerfumeRoseCard />
              <BeautyPerfumeAmberCard />
            </div>
            <BeautyPerfumeSaffronCard />

            {/* Usage */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyPerfumeSeasonCard />
              <BeautyPerfumeOccasionCard />
            </div>
            <BeautyPerfumeStorageCard />
          </div>

          <div className="space-y-6">
            <BeautySkincareMistCard />
            <BeautyHairCareCard hairType="curly" />
            <BeautyNailCareCard />
            <BeautyLipsCareCard />
            <BeautyJewelryCard />
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
