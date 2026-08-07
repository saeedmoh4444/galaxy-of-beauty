'use client';

import {
  PageContainer, PageTitle,
  BeautyMakeupBrushCard, BeautyMakeupBaseCard, BeautyMakeupEyeCard,
  BeautyMakeupLipCard, BeautyMakeupSettingCard, BeautyMakeupContourCard,
  BeautyMakeupBlushCard, BeautyMakeupMascaraCard, BeautyMakeupEyelinerCard,
  BeautyMakeupBrowsCard, BeautyMakeupRemoverCard, BeautyMakeupSpongeCard,
  BeautyMakeupColorCard, BeautyMakeupDayCard, BeautyMakeupNightCard,
  BeautyMakeupBridalCard, BeautyMakeupMinimalCard, BeautyMakeupGlitterCard,
  BeautyMakeupMatteCard, BeautyMakeupDewyCard, BeautyMakeupConcealerCard,
  BeautyMakeupPowderCard, BeautyMakeupPrimerCard, BeautyMakeupMistCard,
  BeautyMakeupRemoveCard, BeautyMakeupOrganizeCard,
  BeautyMakeupTipsCard,
  BeautyFaceShapeCard, BeautyContourGuideCard, BeautyBlushPlacementCard,
  BeautyBrowShapeCard, BeautyLipShapeCard,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function MakeupGuidePage(): JSX.Element {
  return (
    <DashboardLayout role="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle title="💄 دليل المكياج" subtitle="كل ما تحتاجينه لإطلالة مثالية" />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Tools */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyMakeupBrushCard />
              <BeautyMakeupSpongeCard />
            </div>

            {/* Face */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyMakeupBaseCard />
              <BeautyMakeupPrimerCard />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyMakeupConcealerCard />
              <BeautyMakeupPowderCard />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyMakeupContourCard />
              <BeautyMakeupBlushCard />
            </div>
            <BeautyMakeupSettingCard />

            {/* Eyes */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyMakeupEyeCard />
              <BeautyMakeupBrowsCard />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyMakeupMascaraCard />
              <BeautyMakeupEyelinerCard />
            </div>

            {/* Lips */}
            <BeautyMakeupLipCard />

            {/* Color & Style */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyMakeupColorCard />
              <BeautyMakeupRemoverCard />
            </div>

            <BeautyMakeupTipsCard />

            {/* Face Shape & Styling */}
            <BeautyFaceShapeCard />
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyContourGuideCard />
              <BeautyBlushPlacementCard />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyBrowShapeCard />
              <BeautyLipShapeCard />
            </div>

            {/* Looks */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyMakeupDayCard />
              <BeautyMakeupNightCard />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyMakeupBridalCard />
              <BeautyMakeupMinimalCard />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyMakeupGlitterCard />
              <BeautyMakeupMatteCard />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyMakeupDewyCard />
              <BeautyMakeupMistCard />
            </div>

            {/* Maintenance */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyMakeupRemoveCard />
              <BeautyMakeupOrganizeCard />
            </div>
          </div>

          <div className="space-y-6">
            <BeautySkincareVitaminCCard />
            <BeautySkincareRetinolCard />
            <BeautyNailCareCard />
            <BeautyPerfumeCard />
            <BeautyLipsCareCard />
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
