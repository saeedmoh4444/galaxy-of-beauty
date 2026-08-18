'use client';

import {
  PageContainer,
  PageTitle,
  PersonalStylingCard,
  BeautyTimeCapsuleCard,
  BeautyDreamBoardCard,
  BeautySecretSantaCard,
  BeautyVlogCard,
  BeautyPenPalCard,
  BeautyAccountabilityCard,
  BeautyGratefulCircleCard,
  BeautyAffirmationCard,
  BeautyGratitudeCard,
  BeautyReferralLeaderboardCard,
  GroupDiscountBadge,
  ReferralRewardBadge,
  InspirationBoardCard,
  SharedWishlistCard,
  BeautySeasonalLookbookCard,
  BridalBeautyCountdown,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

export default function BeautyExtrasPage(): JSX.Element {
  const { t } = useLocale();
  // referrals.myStats doesn't exist in the API router (leaderboard is the
  // closest real procedure, and it returns groupBy rows without names) —
  // the card keeps showing its built-in fallback list until product
  // decides the intended shape.

  return (
    <DashboardLayout userRole="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle title={t('beautyExtras.title')} subtitle={t('beautyExtras.subtitle')} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Special cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              <PersonalStylingCard
                stylist="نورة"
                price={400}
                duration={t('beautyExtras.minutes90')}
              />
              <BeautyTimeCapsuleCard savedDate="2026-08-06" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyDreamBoardCard
                dreams={[
                  { emoji: '', text: t('beautyExtras.dreamLongHair') },
                  { emoji: '', text: t('beautyExtras.dreamBridalLook') },
                  { emoji: '', text: t('beautyExtras.dreamMakeupMastery') },
                  { emoji: '', text: t('beautyExtras.dreamDailyRoutine') },
                ]}
              />
              <BeautySecretSantaCard
                group={t('beautyExtras.riyadhBrides')}
                budget={200}
                participants={12}
              />
            </div>

            {/* Social */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyAccountabilityCard
                partner="نورة"
                goal={t('beautyExtras.dreamDailyRoutine')}
                streak={12}
              />
              <BeautyGratefulCircleCard
                thanks={[
                  {
                    from: 'نورة',
                    to: 'مها',
                    message: t('beautyExtras.thankSkincareTip'),
                  },
                  { from: 'مها', to: 'ريم', message: t('beautyExtras.alwaysInspiring') },
                ]}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyAffirmationCard />
              <BeautyGratitudeCard entries={15} />
            </div>

            {/* Games + Social */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyReferralLeaderboardCard
                leaders={[
                  { name: 'نورة', referrals: 12, emoji: '' },
                  { name: 'مها', referrals: 8 },
                  { name: 'ريم', referrals: 5 },
                ]}
                userRank={5}
              />
              <GroupDiscountBadge
                groupSize={3}
                discount={15}
                serviceName={t('beautyBudget.spaManicure')}
                originalPrice={150}
              />
            </div>

            {/* Lookbook + Inspiration */}
            <BeautySeasonalLookbookCard season="summer" />
            <div className="grid gap-4 sm:grid-cols-2">
              <InspirationBoardCard
                pins={[
                  { emoji: '', title: t('beautyExtras.softHairstyle'), savedBy: 'نورة' },
                  { emoji: '', title: t('beautyExtras.eveningMakeup'), savedBy: 'مها' },
                  { emoji: '', title: t('beautyExtras.frenchNails'), savedBy: 'ريم' },
                ]}
                collaborators={['نورة', 'مها']}
              />
              <SharedWishlistCard
                items={[
                  { name: t('beautyBudget.spaManicure'), price: 150, emoji: '' },
                  { name: t('beautyCourses.path.title'), price: 350, emoji: '' },
                ]}
                sharedWith={['نورة', t('beautyExtras.myMom')]}
              />
            </div>

            <BridalBeautyCountdown weddingDate="2027-06-15" />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <BeautyVlogCard
              vlog={{
                title: t('beautyExtras.dayInNouraLife'),
                technician: 'نورة',
                duration: t('beautyExtras.minutes8'),
                views: 1234,
                category: t('beautyExtras.categoryMakeup'),
              }}
            />
            <BeautyPenPalCard
              match={{
                city: t('beautyExtras.jeddah'),
                interest: t('beautyExtras.categoryMakeup'),
                emoji: '',
              }}
            />
            <ReferralRewardBadge referralCode="SARA123" referrals={5} discount={15} />
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
