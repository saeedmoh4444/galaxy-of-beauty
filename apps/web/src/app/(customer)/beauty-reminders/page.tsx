'use client';

import {
  PageContainer,
  PageTitle,
  BeautySelfCareReminderCard,
  BeautySleepCard,
  WellnessCheckCard,
  HydrationTracker,
  BeautyHabitTrackerCard,
  CycleResourceCard,
  PrayerTimeReminder,
  DailyBeautyTipCard,
  BeautyAffirmationCard,
  BeautyGratitudeCard,
  SkinJournalCard,
  AllergyTestCard,
  BreastHealthCard,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

export default function BeautyRemindersPage(): JSX.Element {
  const { t } = useLocale();
  return (
    <DashboardLayout userRole="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle title={t('beautyReminders.title')} subtitle={t('beautyReminders.subtitle')} />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <BeautySelfCareReminderCard
              reminder={t('beautyReminders.reminder')}
              emoji=""
              time={t('beautyReminders.time10am')}
            />
            <BeautySleepCard bedtime="22:30" wakeTime="06:30" />
            <HydrationTracker goal={8} current={3} />
            <WellnessCheckCard lastCheck="2026-07" />
            <BeautyHabitTrackerCard
              habits={[
                { name: t('beautyReminders.habitSunscreen'), emoji: '️', done: true },
                { name: t('beautyReminders.habitWater'), emoji: '', done: false },
                { name: t('beautyReminders.habitEvening'), emoji: '', done: true },
              ]}
            />
          </div>
          <div className="space-y-6">
            <PrayerTimeReminder
              nextPrayer={t('beautyReminders.asr')}
              time="15:30"
              minutesUntil={45}
            />
            <DailyBeautyTipCard />
            <BeautyAffirmationCard />
            <BeautyGratitudeCard entries={15} />
            <SkinJournalCard entries={14} streak={5} lastMood="" />
            <CycleResourceCard phase="luteal" />
            <div className="grid gap-4 sm:grid-cols-2">
              <AllergyTestCard lastTest="2026-07" nextDue="2026-12" />
              <BreastHealthCard lastExam="2026-07" nextReminder="2026-08-15" />
            </div>
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
