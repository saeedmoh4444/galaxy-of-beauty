'use client';

import {
  PageContainer,
  PageTitle,
  BeautyEyebrowCard,
  BeautyLashCard,
  BeautyBodyCareCard,
  BeautyTeethCareCard,
  BeautySmileCard,
  BeautyGlowCard,
  BeautyConfidenceCard,
  BeautySpaBathCard,
  BeautyAromatherapyCard,
  BeautyDryBrushingCard,
  BeautyIceFacialCard,
  BeautySteamFacialCard,
  BeautySilkPillowCard,
  BeautyHairRemovalCard,
  BeautyDetoxWaterCard,
  BeautyLEDMaskCard,
  BeautyGuaShaRoutineCard,
  BeautyMicrocurrentCard,
  BeautyRadioFrequencyCard,
  BeautyCryoStickCard,
  BeautyUltrasonicCard,
  BeautyHighFrequencyCard,
  BeautyCelluliteCard,
  BeautyStretchMarksCard,
  BeautyBodySculptingCard,
  BeautyBodyWrapCard,
  BeautyLymphaticDrainageCard,
  BeautyMakeupStorageCard,
  BeautyShelfLifeCard,
  BeautyVanityOrganizationCard,
  BeautyTravelPackingCard,
  BeautyDeclutterCard,
  BeautyNeckCareCard,
  BeautyDecolletageCard,
  BeautyTechNeckCard,
  BeautyNeckMaskCard,
  BeautyNeckFirmingCard,
  BeautyEmergencyKitCard,
  BeautyJewelryCard,
  BeautyBagCard,
  BeautyScarfCard,
  BeautyHandsCareCard,
  BeautyFootCareCard,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

export default function PersonalCarePage(): JSX.Element {
  const { t } = useLocale();
  return (
    <DashboardLayout userRole="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle title={t('personalCare.title')} subtitle={t('personalCare.subtitle')} />

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

            {/* Tools & Rituals */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautySilkPillowCard />
              <BeautyLEDMaskCard />
            </div>

            {/* Beauty Devices */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyMicrocurrentCard />
              <BeautyRadioFrequencyCard />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyCryoStickCard />
              <BeautyUltrasonicCard />
            </div>
            <BeautyHighFrequencyCard />

            {/* Body Treatments */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyCelluliteCard />
              <BeautyStretchMarksCard />
            </div>
            <BeautyBodySculptingCard />
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyBodyWrapCard />
              <BeautyLymphaticDrainageCard />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyGuaShaRoutineCard />
              <BeautyHairRemovalCard />
            </div>
            <BeautyDetoxWaterCard />

            {/* Storage & Organization */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyMakeupStorageCard />
              <BeautyShelfLifeCard />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyVanityOrganizationCard />
              <BeautyTravelPackingCard />
            </div>
            <BeautyDeclutterCard />

            {/* Neck & Décolletage */}
            <BeautyNeckCareCard />
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyDecolletageCard />
              <BeautyTechNeckCard />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyNeckMaskCard />
              <BeautyNeckFirmingCard />
            </div>
            <BeautyEmergencyKitCard />
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
