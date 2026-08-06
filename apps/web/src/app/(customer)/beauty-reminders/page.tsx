'use client';

import {
  PageContainer, PageTitle,
  BeautySelfCareReminderCard, BeautySleepCard, WellnessCheckCard,
  HydrationTracker, BeautyHabitTrackerCard, CycleResourceCard,
  PrayerTimeReminder, DailyBeautyTipCard, BeautyAffirmationCard,
  BeautyGratitudeCard, SkinJournalCard, AllergyTestCard, BreastHealthCard,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function BeautyRemindersPage(): JSX.Element {
  return (
    <DashboardLayout role="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle title="⏰ التذكيرات" subtitle="اعتني بنفسكِ — كل يوم" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <BeautySelfCareReminderCard reminder="خذي 5 دقائق للتنفس العميق والاسترخاء" emoji="🧘" time="10:00 صباحاً" />
            <BeautySleepCard bedtime="22:30" wakeTime="06:30" />
            <HydrationTracker goal={8} current={3} />
            <WellnessCheckCard lastCheck="2026-07" />
            <BeautyHabitTrackerCard habits={[{ name: 'واقي شمس', emoji: '☀️', done: true }, { name: '8 أكواب ماء', emoji: '💧', done: false }, { name: 'روتين مسائي', emoji: '🌙', done: true }]} />
          </div>
          <div className="space-y-6">
            <PrayerTimeReminder nextPrayer="العصر" time="15:30" minutesUntil={45} />
            <DailyBeautyTipCard />
            <BeautyAffirmationCard />
            <BeautyGratitudeCard entries={15} />
            <SkinJournalCard entries={14} streak={5} lastMood="✨" />
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
