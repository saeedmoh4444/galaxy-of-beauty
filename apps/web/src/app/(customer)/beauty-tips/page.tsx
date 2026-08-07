'use client';

import {
  PageContainer, PageTitle,
  BeautySeasonalReminderCard, BeautyIngredientSpotlightCard,
  BeautyTrendAlertCard, BeautyStyleMatchCard,
  BeautyMicroChallengeCard, BeautyQuickTipCard,
  BeautyMakeupTipsCard, BeautySuncareReminderCard,
  BeautyWaterIntakeCard, BeautyDailyCheckInCard,
  BeautyHumidClimateCard, BeautyDryClimateCard, BeautyHotClimateCard,
  BeautyColdClimateCard, BeautyTravelClimateCard,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function BeautyTipsPage(): JSX.Element {
  return (
    <DashboardLayout role="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle title="💡 نصائح وإرشادات" subtitle="كل ما تحتاجينه للعناية بجمالك" />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Seasonal */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautySeasonalReminderCard season="summer" />
              <BeautySeasonalReminderCard season="winter" />
            </div>

            {/* Trends & Style */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyTrendAlertCard trends={[
                { name: 'ألوان الباستيل', emoji: '🎨', heat: '🔥🔥' },
                { name: 'البشرة الزجاجية', emoji: '✨', heat: '🔥🔥🔥' },
                { name: 'العناية بالشفاه', emoji: '💋', heat: '🔥' },
                { name: 'المكياج الطبيعي', emoji: '🌿', heat: '🔥🔥' },
              ]} />
              <BeautyStyleMatchCard matches={[
                { style: 'كلاسيكي', emoji: '👗', match: 92 },
                { style: 'عصري', emoji: '✨', match: 78 },
                { style: 'بوهيمي', emoji: '🌿', match: 65 },
              ]} />
            </div>

            {/* Ingredients */}
            <BeautyIngredientSpotlightCard ingredient={{
              name: 'حمض الهيالورونيك', emoji: '💧', type: 'مرطب', rating: 'A+',
              description: 'يحمل 1000 ضعف وزنه ماء. يوجد طبيعياً في البشرة. يرطب بدون انسداد المسام.',
              suitableFor: ['جميع أنواع البشرة', 'البشرة الجافة', 'البشرة الحساسة'],
              avoidWith: [],
            }} />

            {/* Tips & Challenges */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyQuickTipCard tip={{
                emoji: '☀️', title: 'واقي الشمس', body: 'ضعي واقي الشمس كل ساعتين عند التعرض للشمس المباشرة. الكمية المناسبة: نصف ملعقة صغيرة للوجه.',
                category: 'عناية',
              }} />
              <BeautyMicroChallengeCard challenge={{
                title: 'تحدي الترطيب', emoji: '💧', duration: '5 دقائق',
              }} />
            </div>

            <BeautyMakeupTipsCard />

            {/* Climate-Adaptive Beauty */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyHotClimateCard />
              <BeautyHumidClimateCard />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyDryClimateCard />
              <BeautyColdClimateCard />
            </div>
            <BeautyTravelClimateCard />
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
