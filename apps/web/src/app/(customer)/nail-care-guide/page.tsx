'use client';

import {
  PageContainer,
  PageTitle,
  BeautyNailArtCard,
  BeautyNailShapeCard,
  BeautyNailHealthCard,
  BeautyNailPolishCard,
  BeautyNailGelCard,
  BeautyParaffinCard,
  BeautyHandMaskCard,
  BeautyFootSoakCard,
  BeautyNailStrengthenCard,
  BeautyCallusCareCard,
  BeautyHandsCareCard,
  BeautyFootCareCard,
  BeautyPerfumeCard,
  BeautyLipsCareCard,
  BeautyJewelryCard,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

export default function NailCareGuidePage(): JSX.Element {
  const { t } = useLocale();
  return (
    <DashboardLayout userRole="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle title={t('nailCareGuide.title')} subtitle={t('nailCareGuide.subtitle')} />

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
