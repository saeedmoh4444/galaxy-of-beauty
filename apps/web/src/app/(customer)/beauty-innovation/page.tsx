'use client';

import { api } from '@/lib/trpc';
import {
  PageContainer,
  PageTitle,
  BeautyVoiceAssistantCard,
  BeautyVlogCard,
  BeautyPlaylistCard,
  BeautyWeatherCard,
  SelfieStationBadge,
  BeautyNightOutCard,
  BeautyConciergeCard,
  RandomActOfBeauty,
  JustBecauseFlowers,
  HandwrittenNote,
  MirrorStickerCard,
  BirthdayMonthBadge,
  BeautyTimeCapsuleCard,
  BeautyDreamBoardCard,
  BeautySecretSantaCard,
  BeautyAffirmationCard,
  BeautyQuickTipCard,
  BeautyReferralLeaderboardCard,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function BeautyInnovationPage(): JSX.Element {
  const weather = (api as any).weatherBeauty?.getAdvice?.useQuery?.({
    condition: 'hot',
    temp: 42,
  }) as any;
  const concierge = (api as any).concierge?.stats?.useQuery?.() as any;
  const vlogs = (api as any).beautyVlogs?.list?.useQuery?.({ limit: 1 }) as any;

  return (
    <DashboardLayout userRole="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle title=" الابتكار" subtitle="تقنيات وأدوات ذكية لجمالكِ" />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <BeautyVoiceAssistantCard />

            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyVlogCard
                vlog={{
                  title: 'يوم في حياة نورة',
                  technician: 'نورة',
                  duration: '8 دقائق',
                  views: 1234,
                  category: 'مكياج',
                }}
              />
              <BeautyPlaylistCard />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyWeatherCard
                condition={weather?.data?.condition ?? 'hot'}
                temp={weather?.data?.temp ?? 42}
              />
              <SelfieStationBadge hasRingLight={true} hasPhoneStand={true} hasBackdrop={true} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyNightOutCard available={true} />
              <BeautyConciergeCard conciergeName="سارة" />
            </div>

            <BeautyTimeCapsuleCard savedDate="2026-08-06" />
            <BeautyDreamBoardCard
              dreams={[
                { emoji: '', text: 'شعر طويل صحي' },
                { emoji: '', text: 'إطلالة زفاف' },
                { emoji: '', text: 'إتقان المكياج' },
              ]}
            />
            <BeautySecretSantaCard group="عرايس الرياض" budget={200} participants={12} />

            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyReferralLeaderboardCard
                leaders={[
                  { name: 'نورة', referrals: 12 },
                  { name: 'مها', referrals: 8 },
                  { name: 'ريم', referrals: 5 },
                ]}
                userRank={5}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyQuickTipCard
                tip={{
                  emoji: '',
                  title: 'الماء أولاً',
                  body: 'اشربي كوب ماء قبل قهوتكِ الصباحية.',
                }}
              />
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
