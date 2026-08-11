'use client';

import { api } from '@/lib/trpc';
import {
  PageContainer,
  PageTitle,
  ErrorAlert,
  CardListSkeleton,
  PanicButton,
  WalkMeToCar,
  LocationSharingCard,
  IAmHomeSafe,
  FakeNameGenerator,
  SecureCallBadge,
  FaceBlurToggle,
  IncognitoModeBadge,
  ConsentShield,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function SafetyPage(): JSX.Element {
  const emergencyContacts = (api as any).safety?.getContacts?.useQuery?.() as any;
  const latestBooking = (api as any).bookings?.list?.useQuery?.({ limit: 1 }) as any;

  const booking = (latestBooking?.data?.bookings as any[])?.[0];

  return (
    <DashboardLayout role="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle title="🛡️ الأمان" subtitle="سلامتكِ أولاً — دائماً" />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <PanicButton
              contacts={[
                { name: 'أمي', phone: '0550000000', relation: 'mother' },
                { name: 'أختي', phone: '0551111111' },
              ]}
              address="الرياض — حي الياسمين"
              technicianName="نورة"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <WalkMeToCar appointmentTime="20:30" />
              <IAmHomeSafe appointmentEnd="21:00" graceMinutes={30} />
            </div>
            <LocationSharingCard
              contacts={
                (emergencyContacts?.data as any[])?.map((c: any) => ({
                  name: c.name,
                  phone: c.phone,
                  relation: c.relation,
                })) ?? [{ name: 'أمي', phone: '0550000000', relation: 'mother' }]
              }
              address={booking?.address ?? 'الرياض'}
              technicianName={booking?.technician?.name ?? 'نورة'}
              estimatedEnd={
                booking?.endAt
                  ? new Date(booking.endAt).toLocaleTimeString('ar-SA', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '21:00'
              }
            />
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
