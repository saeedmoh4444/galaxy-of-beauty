'use client';

import {
  PageContainer, PageTitle,
  BeautySquadCard, BeautyFriendActivityCard, BeautyMentorRequestCard,
  BeautyAlumniCard, BeautyScholarshipCard, BeautyCouponCard,
  BeautySavingsChallengeCard, BeautyTechnicianQuoteCard,
  BeautyLanguageExchangeCard, BeautyProgressPhotoCard,
  BeautyVirtualConsultationCard, BeautyRoutineSwapCard,
  BeautyQuietSpaceCard, BeautyPrivacyShieldCard, BeautyMoodBoardCard,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function BeautyCommunityPage(): JSX.Element {
  return (
    <DashboardLayout role="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle title="👯‍♀️ مجتمع الجمال" subtitle="تواصلي، تعلمي، وشاركي رحلتكِ" />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Squad & Friends */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautySquadCard squad={{ name: 'فرقة الرياض', members: 4, nextMeetup: '15 أغسطس', emoji: '💅' }} />
              <BeautyFriendActivityCard activities={[{ friend: 'نورة', action: 'حجزت مكياج', emoji: '💄', time: 'قبل ساعتين' }, { friend: 'مها', action: 'أنهت تحدي العناية', emoji: '✨', time: 'قبل 5 ساعات' }]} />
            </div>

            {/* Mentorship & Alumni */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyMentorRequestCard interests={['مكياج', 'إدارة الصالونات']} />
              <BeautyAlumniCard alumna={{ name: 'نورة', graduationYear: '2025', currentRole: 'مديرة صالون', story: 'من خبيرة تجميل إلى مالكة صالون في سنة واحدة' }} />
            </div>

            {/* Learning & Growth */}
            <BeautyScholarshipCard program={{ name: 'دورة مكياج احترافي', value: 3000, seats: 50, deadline: '30 سبتمبر 2026' }} />

            {/* Savings & Coupons */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyCouponCard code="BEAUTY20" discount={20} expiresAt="2026-12-31" minSpend={150} />
              <BeautySavingsChallengeCard goal={5000} saved={3200} participants={28} />
            </div>

            {/* Community Features */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyTechnicianQuoteCard quote="الجمال يبدأ من الثقة — وثقتكِ تبدأ من العناية بنفسكِ" author="نورة" role="خبيرة تجميل" />
              <BeautyLanguageExchangeCard fromLang="ar" />
            </div>

            {/* Digital Tools */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyVirtualConsultationCard available={true} nextSlot="اليوم 4:00 مساءً" />
              <BeautyProgressPhotoCard photos={3} startDate="2026-06-01" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyRoutineSwapCard />
              <BeautyQuietSpaceCard available={true} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyPrivacyShieldCard />
              <BeautyMoodBoardCard items={[{ emoji: '🌊', label: 'أزرق محيطي' }, { emoji: '🌸', label: 'وردي ناعم' }, { emoji: '✨', label: 'ذهبي لامع' }]} />
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
