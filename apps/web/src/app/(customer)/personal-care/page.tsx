'use client';

import {
  PageContainer, PageTitle,
  BeautyEyebrowCard, BeautyLashCard,
  BeautyBodyCareCard, BeautyTeethCareCard,
  BeautySmileCard, BeautyGlowCard, BeautyConfidenceCard,
  BeautySpaBathCard, BeautyAromatherapyCard, BeautyDryBrushingCard,
  BeautyIceFacialCard, BeautySteamFacialCard,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function PersonalCarePage(): JSX.Element {
  return (
    <DashboardLayout role="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle title="✨ العناية الشخصية" subtitle="تفاصيل صغيرة — تأثير كبير" />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Eyes & Brows */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyEyebrowCard />
              <BeautyLashCard />
            </div>

            {/* Body & Smile */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyBodyCareCard />
              <BeautyTeethCareCard />
            </div>

            {/* Confidence */}
            <div className="grid gap-4 sm:grid-cols-3">
              <BeautySmileCard />
              <BeautyGlowCard />
              <BeautyConfidenceCard />
            </div>

            {/* Spa & Self-Care */}
            <BeautySpaBathCard />
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyAromatherapyCard />
              <BeautyDryBrushingCard />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyIceFacialCard />
              <BeautySteamFacialCard />
            </div>
          </div>

          <div className="space-y-6">
            <BeautyJewelryCard />
            <BeautyBagCard />
            <BeautyScarfCard />
            <BeautyHandsCareCard />
            <BeautyFootCareCard />
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
