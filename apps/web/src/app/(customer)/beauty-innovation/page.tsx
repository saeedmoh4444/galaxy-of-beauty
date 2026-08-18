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
import { useLocale } from '@/components/LocaleProvider';

export default function BeautyInnovationPage(): JSX.Element {
  const { t } = useLocale();
  const weather = api.weatherBeauty.getAdvice.useQuery({
    condition: 'hot',
    temp: 42,
  });

  return (
    <DashboardLayout userRole="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle title={t('beautyInnovation.title')} subtitle={t('beautyInnovation.subtitle')} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <BeautyVoiceAssistantCard />

            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyVlogCard
                vlog={{
                  title: t('beautyInnovation.vlogTitle'),
                  technician: 'نورة',
                  duration: t('beautyInnovation.vlogDuration'),
                  views: 1234,
                  category: t('beautyInnovation.vlogCategory'),
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
                { emoji: '', text: t('beautyInnovation.dreamLongHair') },
                { emoji: '', text: t('beautyInnovation.dreamWeddingLook') },
                { emoji: '', text: t('beautyInnovation.dreamMasterMakeup') },
              ]}
            />
            <BeautySecretSantaCard
              group={t('beautyInnovation.secretSantaGroup')}
              budget={200}
              participants={12}
            />

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
                  title: t('beautyInnovation.tipWaterTitle'),
                  body: t('beautyInnovation.tipWaterBody'),
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
            <BirthdayMonthBadge
              month={t('beautyInnovation.birthdayMonth')}
              discount={15}
              daysRemaining={22}
            />
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
