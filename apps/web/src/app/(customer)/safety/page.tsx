'use client';

import {
  PageContainer, PageTitle,
  PanicButton, WalkMeToCar, LocationSharingCard, IAmHomeSafe,
  FakeNameGenerator, SecureCallBadge, FaceBlurToggle, IncognitoModeBadge,
  ConsentShield,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function SafetyPage(): JSX.Element {
  return (
    <DashboardLayout role="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle title="🛡️ الأمان" subtitle="سلامتكِ أولاً — دائماً" />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <PanicButton contacts={[{ name: 'أمي', phone: '0550000000', relation: 'mother' }, { name: 'أختي', phone: '0551111111' }]} address="الرياض — حي الياسمين" technicianName="نورة" />
            <div className="grid gap-4 sm:grid-cols-2">
              <WalkMeToCar appointmentTime="20:30" />
              <IAmHomeSafe appointmentEnd="21:00" graceMinutes={30} />
            </div>
            <LocationSharingCard contacts={[{ name: 'أمي', phone: '0550000000', relation: 'mother' }]} address="الرياض — حي الياسمين" technicianName="نورة" estimatedEnd="21:00" />
          </div>
          <div className="space-y-6">
            <FakeNameGenerator />
            <SecureCallBadge />
            <FaceBlurToggle />
            <IncognitoModeBadge />
            <ConsentShield />
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
