'use client';

import {
  PageContainer,
  PageTitle,
  CommunityEventCard,
  GalentinesCard,
  BrideTribeCard,
  PromReadyCard,
  BabyShowerCard,
  BeautySeasonalLookbookCard,
  RandomActOfBeauty,
  BirthdayMonthBadge,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function BeautyEventsPage(): JSX.Element {
  return (
    <DashboardLayout userRole="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle title=" المناسبات" subtitle="احتفلي بكل لحظة جميلة" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <BeautySeasonalLookbookCard season="eid" />
            <div className="grid gap-4 sm:grid-cols-2">
              <GalentinesCard
                friends={['نورة', 'مها']}
                date="13 فبراير"
                discount={20}
                totalPrice={450}
              />
              <BrideTribeCard
                bride="سارة"
                bridesmaids={[
                  { name: 'نورة', role: 'وصيفة أولى' },
                  { name: 'مها', lookAssigned: true },
                  { name: 'ريم' },
                ]}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <PromReadyCard event="graduation" age={17} />
              <PromReadyCard event="eid" age={16} />
              <PromReadyCard event="birthday_party" age={18} />
            </div>
            <BabyShowerCard momName="نورة" guests={12} />
            <CommunityEventCard
              event={{
                title: 'لقاء عرايس الرياض',
                date: '15 أغسطس',
                city: 'الرياض',
                time: '6:00 مساءً',
                attendees: 23,
                maxAttendees: 30,
                host: 'صالون الياسمين',
              }}
            />
          </div>
          <div className="space-y-6">
            <RandomActOfBeauty />
            <BirthdayMonthBadge month="مارس" discount={15} daysRemaining={22} />
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
