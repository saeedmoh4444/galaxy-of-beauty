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
import { useLocale } from '@/components/LocaleProvider';

export default function BeautyEventsPage(): JSX.Element {
  const { t } = useLocale();
  return (
    <DashboardLayout userRole="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle title={t('beautyEvents.title')} subtitle={t('beautyEvents.subtitle')} />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <BeautySeasonalLookbookCard season="eid" />
            <div className="grid gap-4 sm:grid-cols-2">
              <GalentinesCard
                friends={['نورة', 'مها']}
                date={t('beautyEvents.galentinesDate')}
                discount={20}
                totalPrice={450}
              />
              <BrideTribeCard
                bride="سارة"
                bridesmaids={[
                  { name: 'نورة', role: t('beautyEvents.maidOfHonor') },
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
                title: t('beautyEvents.meetupTitle'),
                date: t('beautyEvents.meetupDate'),
                city: t('beautyEvents.meetupCity'),
                time: t('beautyEvents.meetupTime'),
                attendees: 23,
                maxAttendees: 30,
                host: t('beautyEvents.meetupHost'),
              }}
            />
          </div>
          <div className="space-y-6">
            <RandomActOfBeauty />
            <BirthdayMonthBadge month={t('beautyEvents.march')} discount={15} daysRemaining={22} />
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
