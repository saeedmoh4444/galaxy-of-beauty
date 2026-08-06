'use client';

import {
  PageContainer, PageTitle,
  BeautyVoiceAssistantCard, BeautyVlogCard, BeautyPlaylistCard,
  BeautyWeatherCard, SelfieStationBadge, BeautyNightOutCard,
  BeautyConciergeCard, RandomActOfBeauty, JustBecauseFlowers,
  HandwrittenNote, MirrorStickerCard, BirthdayMonthBadge,
  BeautyTimeCapsuleCard, BeautyDreamBoardCard, BeautySecretSantaCard,
  BeautyGamificationCard, BeautyQuickTipCard, BeautyAffirmationCard,
  BeautyReferralLeaderboardCard,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

// Placeholder for BeautyGamificationCard
const BeautyGamificationCard = ({ challenges, className }: { challenges?: Array<{ id: string; title: string; emoji: string; points: number; days: number }>; className?: string }) => (
  <div className={className}>🎮 Gamification — coming soon</div>
);

export default function BeautyInnovationPage(): JSX.Element {
  return (
    <DashboardLayout role="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle title="🚀 الابتكار" subtitle="تقنيات وأدوات ذكية لجمالكِ" />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <BeautyVoiceAssistantCard />

            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyVlogCard vlog={{ title: 'يوم في حياة نورة', technician: 'نورة', duration: '8 دقائق', views: 1234, category: 'مكياج' }} />
              <BeautyPlaylistCard />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyWeatherCard condition="hot" temp={42} />
              <SelfieStationBadge hasRingLight={true} hasPhoneStand={true} hasBackdrop={true} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyNightOutCard available={true} />
              <BeautyConciergeCard conciergeName="سارة" />
            </div>

            <BeautyTimeCapsuleCard savedDate="2026-08-06" />
            <BeautyDreamBoardCard dreams={[{ emoji: '💇', text: 'شعر طويل صحي' }, { emoji: '👰', text: 'إطلالة زفاف' }, { emoji: '💄', text: 'إتقان المكياج' }]} />
            <BeautySecretSantaCard group="عرايس الرياض" budget={200} participants={12} />

            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyReferralLeaderboardCard leaders={[{ name: 'نورة', referrals: 12 }, { name: 'مها', referrals: 8 }, { name: 'ريم', referrals: 5 }]} userRank={5} />
              <BeautyGamificationCard />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyQuickTipCard tip={{ emoji: '💧', title: 'الماء أولاً', body: 'اشربي كوب ماء قبل قهوتكِ الصباحية.' }} />
              <BeautyAffirmationCard />
            </div>
          </div>

          <div className="space-y-6">
            <RandomActOfBeauty />
            <JustBecauseFlowers bookingsCount={15} />
            <HandwrittenNote bookingCount={10} technicianName="نورة" />
            <MirrorStickerCard />
            <BirthdayMonthBadge month="مارس" discount={15} daysRemaining={22} />
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
