'use client';

import {
  PageContainer,
  PageTitle,
  BeautySquadCard,
  BeautyFriendActivityCard,
  BeautyMentorRequestCard,
  BeautyAlumniCard,
  BeautyScholarshipCard,
  BeautyCouponCard,
  BeautySavingsChallengeCard,
  BeautyTechnicianQuoteCard,
  BeautyLanguageExchangeCard,
  BeautyProgressPhotoCard,
  BeautyVirtualConsultationCard,
  BeautyRoutineSwapCard,
  BeautyQuietSpaceCard,
  BeautyPrivacyShieldCard,
  BeautyMoodBoardCard,
  BeautyAffirmationCard,
  BeautyGratitudeCard,
  BeautyDailyCheckInCard,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

export default function BeautyCommunityPage(): JSX.Element {
  const { t } = useLocale();
  return (
    <DashboardLayout userRole="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle title={t('community.hubTitle')} subtitle={t('community.hubSubtitle')} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Squad & Friends */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautySquadCard squad={{ name: t('community.squadName'), members: 4, emoji: '' }} />
              <BeautyFriendActivityCard
                activities={[
                  {
                    friend: t('community.name.noura'),
                    action: t('community.activity.bookedMakeup'),
                    emoji: '',
                    time: t('community.time.twoHoursAgo'),
                  },
                  {
                    friend: t('community.name.maha'),
                    action: t('community.activity.finishedChallenge'),
                    emoji: '',
                    time: t('community.time.fiveHoursAgo'),
                  },
                ]}
              />
            </div>

            {/* Mentorship & Alumni */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyMentorRequestCard
                interests={[
                  t('community.interest.makeup'),
                  t('community.interest.salonManagement'),
                ]}
              />
              <BeautyAlumniCard
                alumna={{
                  name: t('community.name.noura'),
                  graduationYear: '2025',
                  currentRole: t('community.alumna.role'),
                  story: t('community.alumna.story'),
                }}
              />
            </div>

            {/* Learning & Growth */}
            <BeautyScholarshipCard
              program={{ name: t('community.scholarship.name'), value: 3000, seats: 50 }}
            />

            {/* Savings & Coupons */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyCouponCard code="BEAUTY20" discount={20} expiresAt="2026-12-31" />
              <BeautySavingsChallengeCard
                challenge={{
                  name: t('community.challenge.name'),
                  emoji: '',
                  target: 5000,
                  saved: 3200,
                  days: 30,
                }}
              />
            </div>

            {/* Community Features */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyTechnicianQuoteCard
                quote={{
                  text: t('community.quote.text'),
                  author: t('community.name.noura'),
                  role: t('community.quote.role'),
                }}
              />
              <BeautyLanguageExchangeCard fromLang="ar" />
            </div>

            {/* Digital Tools */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyVirtualConsultationCard
                specialist={t('community.specialist.name')}
                specialty={t('community.specialist.specialty')}
                emoji="‍️"
              />
              <BeautyProgressPhotoCard
                photos={[{ date: '2026-06-01', emoji: '', note: t('community.photo.note') }]}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyRoutineSwapCard
                swaps={[
                  {
                    from: t('community.swap.from'),
                    to: t('community.swap.to'),
                    reason: t('community.swap.reason'),
                  },
                ]}
              />
              <BeautyQuietSpaceCard
                features={[
                  t('community.feature.dimLights'),
                  t('community.feature.quietMusic'),
                  t('community.feature.noNoise'),
                ]}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyPrivacyShieldCard
                status={{ photosEncrypted: true, locationHidden: true, dataEncrypted: true }}
              />
              <BeautyMoodBoardCard
                items={[
                  { emoji: '', label: t('community.mood.oceanBlue') },
                  { emoji: '', label: t('community.mood.softPink') },
                  { emoji: '', label: t('community.mood.shimmeringGold') },
                ]}
              />
            </div>
          </div>

          <div className="space-y-6">
            <BeautyAffirmationCard />
            <BeautyGratitudeCard entries={15} />
            <BeautyDailyCheckInCard />
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
