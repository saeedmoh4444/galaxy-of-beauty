'use client';

import {
  PageContainer,
  PageTitle,
  BeautyJewelryCard,
  BeautyBagCard,
  BeautyScarfCard,
  BeautyPerfumeCard,
  BeautyNailCareCard,
  BeautyLipsCareCard,
  BeautyHandsCareCard,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

export default function AccessoriesGuidePage(): JSX.Element {
  const { t } = useLocale();
  return (
    <DashboardLayout userRole="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle title={t('accessoriesGuide.title')} subtitle={t('accessoriesGuide.subtitle')} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <BeautyJewelryCard />
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyBagCard />
              <BeautyScarfCard />
            </div>
          </div>

          <div className="space-y-6">
            <BeautyPerfumeCard />
            <BeautyNailCareCard />
            <BeautyLipsCareCard />
            <BeautyHandsCareCard />
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
