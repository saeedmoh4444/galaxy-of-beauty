'use client';

import {
  PageContainer,
  PageTitle,
  BeautySeasonalReminderCard,
  BeautyIngredientSpotlightCard,
  BeautyTrendAlertCard,
  BeautyStyleMatchCard,
  BeautyMicroChallengeCard,
  BeautyQuickTipCard,
  BeautyMakeupTipsCard,
  BeautySuncareReminderCard,
  BeautyWaterIntakeCard,
  BeautyDailyCheckInCard,
  BeautyHumidClimateCard,
  BeautyDryClimateCard,
  BeautyHotClimateCard,
  BeautyColdClimateCard,
  BeautyTravelClimateCard,
  BeautySkincareMistakesCard,
  BeautyMakeupMistakesCard,
  BeautyHairMistakesCard,
  BeautyOverExfoliatingCard,
  BeautyProductOverloadCard,
  BeautyEidGlowCard,
  BeautyEidHairCard,
  BeautyEidNailsCard,
  BeautyEidPerfumeCard,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

export default function BeautyTipsPage(): JSX.Element {
  const { t } = useLocale();
  return (
    <DashboardLayout userRole="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle title={t('beautyTips.title')} subtitle={t('beautyTips.subtitle')} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Seasonal */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautySeasonalReminderCard season="summer" />
              <BeautySeasonalReminderCard season="winter" />
            </div>

            {/* Trends & Style */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyTrendAlertCard
                trends={[
                  { name: t('beautyTips.trend.pastel'), emoji: '', heat: '' },
                  { name: t('beautyTips.trend.glassSkin'), emoji: '', heat: '' },
                  { name: t('beautyTips.trend.lipCare'), emoji: '', heat: '' },
                  { name: t('beautyTips.trend.naturalMakeup'), emoji: '', heat: '' },
                ]}
              />
              <BeautyStyleMatchCard
                matches={[
                  { style: t('beautyTips.style.classic'), emoji: '', match: 92 },
                  { style: t('beautyTips.style.modern'), emoji: '', match: 78 },
                  { style: t('beautyTips.style.boho'), emoji: '', match: 65 },
                ]}
              />
            </div>

            {/* Ingredients */}
            <BeautyIngredientSpotlightCard
              ingredient={{
                name: t('beautyTips.ingredient.name'),
                emoji: '',
                type: t('beautyTips.ingredient.type'),
                rating: 'A+',
                description: t('beautyTips.ingredient.desc'),
                suitableFor: [
                  t('beautyTips.ingredient.suitable.all'),
                  t('beautyTips.ingredient.suitable.dry'),
                  t('beautyTips.ingredient.suitable.sensitive'),
                ],
                avoidWith: [],
              }}
            />

            {/* Tips & Challenges */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyQuickTipCard
                tip={{
                  emoji: '️',
                  title: t('beautyTips.tip.title'),
                  body: t('beautyTips.tip.body'),
                  source: t('beautyTips.tip.source'),
                }}
              />
              <BeautyMicroChallengeCard
                challenge={{
                  title: t('beautyTips.challenge.title'),
                  emoji: '',
                  duration: t('beautyTips.challenge.duration'),
                }}
              />
            </div>

            <BeautyMakeupTipsCard />

            {/* Climate-Adaptive */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyHotClimateCard />
              <BeautyHumidClimateCard />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyDryClimateCard />
              <BeautyColdClimateCard />
            </div>
            <BeautyTravelClimateCard />

            {/* Common Mistakes */}
            <BeautySkincareMistakesCard />
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyMakeupMistakesCard />
              <BeautyHairMistakesCard />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyOverExfoliatingCard />
              <BeautyProductOverloadCard />
            </div>

            {/* Eid Preparation */}
            <BeautyEidGlowCard />
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyEidHairCard />
              <BeautyEidNailsCard />
            </div>
            <BeautyEidPerfumeCard />
          </div>

          <div className="space-y-6">
            <BeautySuncareReminderCard spf={50} />
            <BeautyWaterIntakeCard goal={8} />
            <BeautyDailyCheckInCard />
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
