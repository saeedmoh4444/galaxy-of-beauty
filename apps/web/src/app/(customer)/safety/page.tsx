'use client';

import { api } from '@/lib/trpc';
import {
  PageContainer,
  PageTitle,
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
  const emergencyContacts = api.safety.getContacts.useQuery();
  const latestBooking = api.bookings.list.useQuery({ limit: 1 });

  const booking = latestBooking?.data?.bookings?.[0];

  return (
    <DashboardLayout userRole="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle title="️ الأمان" subtitle="سلامتكِ أولاً — دائماً" />

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
                emergencyContacts?.data?.map((c) => ({
                  name: c.name,
                  phone: c.phone,
                  relation: c.relation ?? undefined,
                })) ?? [{ name: 'أمي', phone: '0550000000', relation: 'mother' }]
              }
              address={(booking?.address as unknown as string) ?? 'الرياض'}
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
