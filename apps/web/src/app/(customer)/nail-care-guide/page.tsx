'use client';

import {
  PageContainer, PageTitle,
  BeautyNailArtCard, BeautyNailShapeCard, BeautyNailHealthCard,
  BeautyNailPolishCard, BeautyNailGelCard,
  BeautyParaffinCard, BeautyHandMaskCard, BeautyFootSoakCard,
  BeautyNailStrengthenCard, BeautyCallusCareCard,
  BeautyHandsCareCard, BeautyFootCareCard, BeautyPerfumeCard,
  BeautyLipsCareCard, BeautyJewelryCard,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function NailCareGuidePage(): JSX.Element {
  return (
    <DashboardLayout role="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle title="💅 دليل العناية بالأظافر" subtitle="كل ما تحتاجينه لأظافر جميلة وصحية" />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <BeautyNailArtCard />
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyNailShapeCard />
              <BeautyNailHealthCard />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyNailPolishCard />
              <BeautyNailGelCard />
            </div>

            {/* Hand & Foot Care */}
            <BeautyNailStrengthenCard />
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyParaffinCard />
              <BeautyHandMaskCard />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyFootSoakCard />
              <BeautyCallusCareCard />
            </div>
          </div>

          <div className="space-y-6">
            <BeautyHandsCareCard />
            <BeautyFootCareCard />
            <BeautyPerfumeCard />
            <BeautyLipsCareCard />
            <BeautyJewelryCard />
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
