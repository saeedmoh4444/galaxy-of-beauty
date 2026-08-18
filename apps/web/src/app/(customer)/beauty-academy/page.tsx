'use client';

import { api } from '@/lib/trpc';
import {
  PageContainer,
  PageTitle,
  FreeCourseCard,
  BeautyWikiCard,
  BeautyQuizCard,
  BeautyTriviaCard,
  BeautyFlashCard,
  BeautyMythBusterCard,
  IngredientGlossaryCard,
  BeautyInfographicCard,
  BeautyRecipeCard,
  BeautyBookClubCard,
  BeautyQuickTipCard,
  BeautyIngredientHighlightCard,
  AskDermatologistCard,
  BeautyWebinarCard,
  BeautyExpertTalkCard,
  BeautyCareerPathCard,
  BeautyCertificationPathCard,
  BeautyLearningPathCard,
  AcademyCertificateBadge,
  ProBonoLessonCard,
  SaudiBeautyHeritageCard,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

// Legacy page shape: the card grid below expects `{ items }`, but
// beautyCourses.list returns a plain array — the optional chain falls
// through (grid renders nothing) exactly as before.
interface LegacyCourseItem {
  title?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  duration?: string;
  lessons?: number;
  instructor?: string;
  enrolled?: number;
  emoji?: string;
  hasCertificate?: boolean;
}

export default function BeautyAcademyPage(): JSX.Element {
  const { t } = useLocale();
  const courses = api.beautyCourses.list.useQuery();
  const dailyTip = api.dailyBeautyTip.today.useQuery();
  const expertTalks = api.expertTalks.upcoming.useQuery({ limit: 2 });
  const myths = api.beautyMyths.getRandom.useQuery();
  const recipes = api.beautyRecipes.list.useQuery({ limit: 2 });
  const bookClubs = api.bookClub.list.useQuery({ limit: 2 });
  return (
    <DashboardLayout userRole="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle title={t('academy.title')} subtitle={t('academy.subtitle')} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Courses + Webinars */}
            <div className="grid gap-4 sm:grid-cols-2">
              {(courses?.data as unknown as { items?: LegacyCourseItem[] })?.items
                ?.slice(0, 2)
                .map((c, i) => (
                  <FreeCourseCard
                    key={i}
                    course={{
                      title: c.title ?? t('academy.courseFallback'),
                      level: c.level ?? 'beginner',
                      duration: c.duration ?? t('academy.duration45'),
                      lessons: c.lessons ?? 6,
                      instructor: c.instructor,
                      enrolled: c.enrolled,
                      emoji: c.emoji ?? '',
                      hasCertificate: c.hasCertificate,
                    }}
                  />
                )) ?? (
                <>
                  <FreeCourseCard
                    course={{
                      title: t('academy.course.skincareBasics'),
                      level: 'beginner',
                      duration: t('academy.duration45'),
                      lessons: 6,
                      instructor: 'د. نورة',
                      enrolled: 1234,
                      emoji: '',
                    }}
                  />
                  <FreeCourseCard
                    course={{
                      title: t('academy.course.professionalMakeup'),
                      level: 'intermediate',
                      duration: t('academy.duration90'),
                      lessons: 12,
                      hasCertificate: true,
                      emoji: '',
                    }}
                  />
                </>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {expertTalks?.data?.slice(0, 2).map((t, i) => (
                <BeautyExpertTalkCard
                  key={i}
                  talk={{
                    title: t.title,
                    expert: t.expert,
                    date: t.date,
                    isFree: t.isFree,
                    emoji: t.emoji,
                  }}
                />
              )) ?? (
                <>
                  <BeautyWebinarCard
                    webinar={{
                      title: t('academy.talk.skinSecrets'),
                      instructor: 'د. نورة',
                      date: t('academy.dateAug20'),
                      time: t('academy.timeAug20'),
                      isFree: true,
                      topic: t('academy.topic.care'),
                    }}
                  />
                  <BeautyExpertTalkCard
                    talk={{
                      title: t('academy.talk.beautyEntrepreneurship'),
                      expert: 'م. سارة',
                      date: t('academy.dateSep15'),
                      isFree: true,
                      emoji: '',
                    }}
                  />
                </>
              )}
            </div>
            <AskDermatologistCard
              doctor={{
                name: 'د. نورة القحطاني',
                specialty: t('academy.specialty.dermatology'),
                credentials: t('academy.credentials.saudiBoard'),
              }}
              nextSession="2026-08-20"
              questionsCount={15}
            />

            {/* Learning tools */}
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyQuizCard />
              <BeautyFlashCard />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <BeautyMythBusterCard
                myth={myths?.data?.myth ?? t('academy.myth.toothpaste')}
                fact={myths?.data?.fact ?? t('academy.myth.toothpasteFact')}
                source={myths?.data?.source ?? t('academy.myth.source')}
              />
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
            <BeautyWikiCard
              entry={{
                title: t('academy.ingredient.vitaminC'),
                category: 'ingredient',
                excerpt: t('academy.ingredient.vitaminCExcerpt'),
                readTime: 5,
                verified: true,
                isArabicOriginal: true,
              }}
            />
            <IngredientGlossaryCard
              ingredient={{
                name: t('academy.ingredient.vitaminC'),
                type: 'antioxidant',
                benefits: [
                  t('academy.ingredient.benefit.brightening'),
                  t('academy.ingredient.benefit.antioxidant'),
                  t('academy.ingredient.benefit.collagen'),
                ],
                suitableFor: [t('academy.ingredient.allSkinTypes')],
                warnings: [t('academy.ingredient.warning.retinol')],
              }}
            />
            <BeautyIngredientHighlightCard
              ingredient={{
                name: t('academy.ingredient.arganOil'),
                origin: t('academy.ingredient.morocco'),
                benefits: [
                  t('academy.ingredient.benefit.hydration'),
                  t('academy.ingredient.benefit.antiAging'),
                  t('academy.ingredient.benefit.hairStrengthening'),
                ],
                funFact: t('academy.ingredient.arganFunFact'),
              }}
            />
            <BeautyRecipeCard
              recipe={{
                title: recipes?.data?.items?.[0]?.title ?? t('academy.recipe.honeyYogurt'),
                ingredients: (recipes?.data?.items?.[0]?.ingredientsJson as string[]) ?? [
                  t('academy.recipe.ingredient.honey'),
                  t('academy.recipe.ingredient.yogurt'),
                  t('academy.recipe.ingredient.lemon'),
                ],
                steps: (recipes?.data?.items?.[0]?.stepsJson as string[]) ?? [
                  t('academy.recipe.step.mix'),
                  t('academy.recipe.step.apply'),
                  t('academy.recipe.step.rinse'),
                ],
                duration: recipes?.data?.items?.[0]?.duration ?? t('academy.recipe.duration'),
                forSkin: recipes?.data?.items?.[0]?.forSkin ?? t('academy.recipe.forSkin'),
              }}
            />
            <BeautyBookClubCard
              book={{
                title: bookClubs?.data?.items?.[0]?.title ?? t('academy.book.arabBeautySecrets'),
                author: bookClubs?.data?.items?.[0]?.author ?? 'د. نورة',
                members: bookClubs?.data?.items?.[0]?.members ?? 45,
                currentChapter:
                  bookClubs?.data?.items?.[0]?.currentChapter ?? t('academy.book.chapter3'),
                nextMeeting: bookClubs?.data?.items?.[0]?.nextMeeting ?? t('academy.dateAug25'),
              }}
            />
            <SaudiBeautyHeritageCard practice="henna" />
            <BeautyInfographicCard
              topic={t('academy.info.sunProtection')}
              emoji="️"
              stats={[
                { label: t('academy.info.uvaRays'), value: '95%', desc: t('academy.info.uvaDesc') },
                { label: 'SPF 30', value: '97%', desc: t('academy.info.spfDesc') },
              ]}
              source={t('academy.info.who')}
            />
            <BeautyQuickTipCard
              tip={{
                emoji: dailyTip?.data?.emoji ?? '',
                title: dailyTip?.data?.category ?? t('academy.tip.waterFirst'),
                body: dailyTip?.data?.tip ?? t('academy.tip.waterBody'),
                source: t('academy.title'),
              }}
            />
            <ProBonoLessonCard lessons={24} volunteers={8} />
            <AcademyCertificateBadge
              certificate={{
                course: t('academy.course.professionalMakeup'),
                level: 'professional',
                date: '2026-07',
                certId: 'GOB-2026-001',
                isBlockchainVerified: true,
              }}
            />
            <BeautyLearningPathCard
              path={{
                title: t('academy.course.professionalMakeup'),
                modules: 8,
                completed: 3,
                emoji: '',
                duration: t('academy.path.sixMonths'),
              }}
            />
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
