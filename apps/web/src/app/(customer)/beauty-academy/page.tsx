'use client';

import {
  PageContainer, PageTitle,
  FreeCourseCard, BeautyWikiCard, BeautyQuizCard, BeautyTriviaCard,
  BeautyFlashCard, BeautyMythBusterCard, IngredientGlossaryCard,
  BeautyInfographicCard, BeautyRecipeCard, BeautyBookClubCard,
  BeautyQuickTipCard, BeautyIngredientHighlightCard,
  AskDermatologistCard, BeautyWebinarCard, BeautyExpertTalkCard,
  BeautyCareerPathCard, BeautyCertificationPathCard, BeautyLearningPathCard,
  AcademyCertificateBadge, ProBonoLessonCard, SaudiBeautyHeritageCard,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function BeautyAcademyPage(): JSX.Element {
  return (
    <DashboardLayout role="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle title="📚 أكاديمية الجمال" subtitle="تعلمي، اكتشفي، وتطوري" />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Courses + Webinars */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FreeCourseCard course={{ title: 'أساسيات العناية بالبشرة', level: 'beginner', duration: '45 دقيقة', lessons: 6, instructor: 'د. نورة', enrolled: 1234, emoji: '🧴' }} />
              <FreeCourseCard course={{ title: 'مكياج احترافي', level: 'intermediate', duration: '90 دقيقة', lessons: 12, hasCertificate: true, emoji: '💄' }} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyWebinarCard webinar={{ title: 'أسرار البشرة', instructor: 'د. نورة', date: '20 أغسطس', time: '8:00 مساءً', isFree: true, topic: 'عناية' }} />
              <BeautyExpertTalkCard talk={{ title: 'ريادة الأعمال في التجميل', expert: 'م. سارة', date: '15 سبتمبر', isFree: true, emoji: '💼' }} />
            </div>
            <AskDermatologistCard doctor={{ name: 'د. نورة القحطاني', specialty: 'الأمراض الجلدية والتجميل', credentials: 'البورد السعودي' }} nextSession="2026-08-20" questionsCount={15} />

            {/* Learning tools */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyQuizCard />
              <BeautyFlashCard />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyMythBusterCard myth="معجون الأسنان يعالج الحبوب" fact="معجون الأسنان يهيج البشرة ويسبب حروقاً كيميائية" source="مجلة الأمراض الجلدية" />
              <BeautyTriviaCard />
            </div>

            {/* Career paths */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyCareerPathCard path="makeup_artist" />
              <BeautyCertificationPathCard path="skincare" />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <BeautyWikiCard entry={{ title: 'فيتامين سي', category: 'ingredient', excerpt: 'فيتامين سي هو مضاد أكسدة قوي يساعد على تفتيح البشرة وتوحيد لونها...', readTime: 5, verified: true, isArabicOriginal: true }} />
            <IngredientGlossaryCard ingredient={{ name: 'فيتامين سي', type: 'antioxidant', benefits: ['تفتيح', 'مضاد أكسدة', 'تحفيز الكولاجين'], suitableFor: ['جميع أنواع البشرة'], warnings: ['لا يخلط مع الريتينول'] }} />
            <BeautyIngredientHighlightCard ingredient={{ name: 'زيت الأرغان', origin: 'المغرب', benefits: ['ترطيب', 'مضاد شيخوخة', 'تقوية الشعر'], funFact: 'يحتوي على فيتامين E أكثر بـ 3 مرات من زيت الزيتون' }} />
            <BeautyRecipeCard recipe={{ title: 'ماسك العسل والزبادي', ingredients: ['ملعقة عسل', 'ملعقة زبادي', 'قطرات ليمون'], steps: ['اخلطي المكونات', 'ضعيها على الوجه 15 دقيقة', 'اغسلي بماء فاتر'], duration: '15 دقيقة', forSkin: 'جميع الأنواع' }} />
            <BeautyBookClubCard book={{ title: 'أسرار الجمال العربي', author: 'د. نورة', members: 45, currentChapter: 'الفصل 3', nextMeeting: '25 أغسطس' }} />
            <SaudiBeautyHeritageCard practice="henna" />
            <BeautyInfographicCard topic="الحماية من الشمس" emoji="☀️" stats={[{ label: 'أشعة UVA', value: '95%', desc: 'تخترق الغيوم والزجاج' }, { label: 'SPF 30', value: '97%', desc: 'نسبة الحماية' }]} source="منظمة الصحة العالمية" />
            <BeautyQuickTipCard tip={{ emoji: '💧', title: 'الماء أولاً', body: 'اشربي كوب ماء قبل قهوتكِ الصباحية — بشرتكِ ستشكركِ', source: 'أكاديمية الجمال' }} />
            <ProBonoLessonCard lessons={24} volunteers={8} />
            <AcademyCertificateBadge certificate={{ course: 'مكياج احترافي', level: 'professional', date: '2026-07', certId: 'GOB-2026-001', isBlockchainVerified: true }} />
            <BeautyLearningPathCard path={{ title: 'مكياج احترافي', modules: 8, completed: 3, emoji: '💄', duration: '6 أشهر' }} />
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
