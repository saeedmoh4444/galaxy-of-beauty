// W6-1 queue sweep: wrap each remaining client page.tsx into a server
// wrapper with locale-aware metadata. Run: node scripts/seo-queue-sweep.mjs
import { readFileSync, writeFileSync, renameSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'apps/web/src/app';

// pageDir -> [ClientName, PageName, titleKey, subtitleKey, opts?]
const PAGES = {
  '(public)/api-docs': [
    'ApiDocsClient',
    'ApiDocsPage',
    'marketing.api-docs.title',
    'marketing.api-docs.subtitle',
  ],
  '(public)/beauty-awards': [
    'BeautyAwardsClient',
    'BeautyAwardsPage',
    'marketing.beauty-awards.title',
    'marketing.beauty-awards.subtitle',
  ],
  '(public)/beauty-expo': [
    'BeautyExpoClient',
    'BeautyExpoPage',
    'marketing.beauty-expo.title',
    'marketing.beauty-expo.subtitle',
  ],
  '(public)/beauty-faq': [
    'BeautyFaqClient',
    'BeautyFaqPage',
    'marketing.beauty-faq.title',
    'marketing.beauty-faq.subtitle',
  ],
  '(public)/beauty-fortune': [
    'BeautyFortuneClient',
    'BeautyFortunePage',
    'marketing.beauty-fortune.title',
    'marketing.beauty-fortune.subtitle',
  ],
  '(public)/beauty-podcast': [
    'BeautyPodcastClient',
    'BeautyPodcastPage',
    'marketing.beauty-podcast.title',
    'marketing.beauty-podcast.subtitle',
  ],
  '(public)/beauty-posts': [
    'BeautyPostsClient',
    'BeautyPostsPage',
    'beautyPosts.title',
    'beautyPosts.subtitle',
  ],
  '(public)/beauty-quiz': [
    'BeautyQuizClient',
    'BeautyQuizPage',
    'marketing.beauty-quiz.title',
    'marketing.beauty-quiz.subtitle',
  ],
  '(public)/beauty-shorts': [
    'BeautyShortsClient',
    'BeautyShortsPage',
    'beautyShorts.title',
    'marketing.beauty-shorts.subtitle',
  ],
  '(public)/beauty-stories': [
    'BeautyStoriesClient',
    'BeautyStoriesPage',
    'marketing.beauty-stories.title',
    'marketing.beauty-stories.subtitle',
  ],
  '(public)/behind-scenes': [
    'BehindScenesClient',
    'BehindScenesPage',
    'marketing.behind-scenes.title',
    'marketing.behind-scenes.subtitle',
  ],
  '(public)/booking-heatmap': [
    'BookingHeatmapClient',
    'BookingHeatmapPage',
    'marketing.booking-heatmap.title',
    'marketing.booking-heatmap.subtitle',
  ],
  '(public)/bundles/custom': [
    'BundlesCustomClient',
    'BundlesPage',
    'marketing.bundles.title',
    'marketing.bundles.subtitle',
  ],
  '(public)/compare': [
    'CompareClient',
    'ComparePage',
    'marketing.compare.title',
    'marketing.compare.subtitle',
  ],
  '(public)/event-tickets': [
    'EventTicketsClient',
    'EventTicketsPage',
    'marketing.event-tickets.title',
    'marketing.event-tickets.subtitle',
  ],
  '(public)/featured-tech': [
    'FeaturedTechClient',
    'FeaturedTechPage',
    'marketing.featured-tech.title',
    'marketing.featured-tech.subtitle',
  ],
  '(public)/gift-quiz': [
    'GiftQuizClient',
    'GiftQuizPage',
    'marketing.gift-quiz.title',
    'marketing.gift-quiz.subtitle',
  ],
  '(public)/ingredient-analyzer': [
    'IngredientAnalyzerClient',
    'IngredientAnalyzerPage',
    'marketing.ingredient-analyzer.title',
    'marketing.ingredient-analyzer.subtitle',
  ],
  '(public)/ingredient-sub': [
    'IngredientSubClient',
    'IngredientSubPage',
    'marketing.ingredient-sub.title',
    'marketing.ingredient-sub.subtitle',
  ],
  '(public)/live-stream': [
    'LiveStreamClient',
    'LiveStreamPage',
    'marketing.live-stream.title',
    'marketing.live-stream.subtitle',
  ],
  '(public)/live-stream/[id]': [
    'LiveStreamDetailClient',
    'LiveStreamDetailPage',
    'marketing.live-stream.title',
    'marketing.live-stream.subtitle',
    { path: '/live-stream' },
  ],
  '(public)/look-of-the-day': [
    'LookOfTheDayClient',
    'LookOfTheDayPage',
    'marketing.look-of-the-day.title',
    'marketing.look-of-the-day.subtitle',
  ],
  '(public)/onboarding': [
    'OnboardingClient',
    'OnboardingPage',
    'marketing.onboarding.title',
    'marketing.onboarding.subtitle',
  ],
  '(public)/price-estimator': [
    'PriceEstimatorClient',
    'PriceEstimatorPage',
    'marketing.price-estimator.title',
    'marketing.price-estimator.subtitle',
  ],
  '(public)/product-compare': [
    'ProductCompareClient',
    'ProductComparePage',
    'marketing.product-compare.title',
    'marketing.product-compare.subtitle',
  ],
  '(public)/referral-race': [
    'ReferralRaceClient',
    'ReferralRacePage',
    'marketing.referral-race.title',
    'marketing.referral-race.subtitle',
  ],
  '(public)/salon-map': [
    'SalonMapClient',
    'SalonMapPage',
    'marketing.salon-map.title',
    'marketing.salon-map.subtitle',
  ],
  '(public)/search': [
    'SearchClient',
    'SearchPage',
    'marketing.search.title',
    'marketing.search.subtitle',
  ],
  '(public)/service-matchmaker': [
    'ServiceMatchmakerClient',
    'ServiceMatchmakerPage',
    'marketing.service-matchmaker.title',
    'marketing.service-matchmaker.subtitle',
  ],
  '(public)/service-recommender': [
    'ServiceRecommenderClient',
    'ServiceRecommenderPage',
    'marketing.service-recommender.title',
    'marketing.service-recommender.subtitle',
  ],
  '(public)/service-trends': [
    'ServiceTrendsClient',
    'ServiceTrendsPage',
    'marketing.service-trends.title',
    'marketing.service-trends.subtitle',
  ],
  '(public)/smart-pricing': [
    'SmartPricingClient',
    'SmartPricingPage',
    'marketing.smart-pricing.title',
    'marketing.smart-pricing.subtitle',
  ],
  '(public)/status': ['StatusClient', 'StatusPage', 'status.title', 'status.subtitle'],
  '(public)/tech-calendar': [
    'TechCalendarClient',
    'TechCalendarPage',
    'marketing.tech-calendar.title',
    'marketing.tech-calendar.subtitle',
  ],
  '(public)/tech-leaderboard': [
    'TechLeaderboardClient',
    'TechLeaderboardPage',
    'marketing.tech-leaderboard.title',
    'marketing.tech-leaderboard.subtitle',
  ],
  '(public)/technician-badges': [
    'TechnicianBadgesClient',
    'TechnicianBadgesPage',
    'marketing.technician-badges.title',
    'marketing.technician-badges.subtitle',
  ],
  '(public)/technician-compare': [
    'TechnicianCompareClient',
    'TechnicianComparePage',
    'marketing.technician-compare.title',
    'marketing.technician-compare.subtitle',
  ],
  '(public)/technician-qa': [
    'TechnicianQAClient',
    'TechnicianQAPage',
    'marketing.technician-qa.title',
    'marketing.technician-qa.subtitle',
  ],
  '(public)/tutorials/[id]': [
    'TutorialDetailClient',
    'TutorialDetailPage',
    'marketing.tutorials.title',
    'marketing.tutorials.subtitle',
    { path: '/tutorials' },
  ],
  '(public)/video-testimonials': [
    'VideoTestimonialsClient',
    'VideoTestimonialsPage',
    'marketing.video-testimonials.title',
    'marketing.video-testimonials.subtitle',
  ],
  offline: ['OfflineClient', 'OfflinePage', 'offline.title', 'offline.desc', { noIndex: true }],
};

for (const [dir, [clientName, pageName, titleKey, subtitleKey, opts]] of Object.entries(PAGES)) {
  const page = join(ROOT, dir, 'page.tsx');
  const client = join(ROOT, dir, `${clientName}.tsx`);
  if (!existsSync(page)) throw new Error(`no page.tsx in ${dir}`);
  if (readFileSync(page, 'utf8').includes('generateMetadata')) {
    console.log(`skip ${dir} (already wrapped)`);
    continue;
  }

  let src = readFileSync(page, 'utf8');
  if (!/^['"]use client['"]/.test(src)) throw new Error(`${page} is not a client page`);
  const re = new RegExp(`export default function ${pageName}\\b`);
  if (!re.test(src)) throw new Error(`${page}: default export ${pageName} not found`);
  src = src.replace(re, `export function ${clientName}`);

  renameSync(page, client);
  writeFileSync(client, src);

  const noIndexLine = opts?.noIndex ? '\n    noIndex: true,' : '';
  const wrapper = `import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { ${clientName} } from './${clientName}';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('${titleKey}', 'ar'),
    titleEn: t('${titleKey}', 'en'),
    descriptionAr: t('${subtitleKey}', 'ar'),
    descriptionEn: t('${subtitleKey}', 'en'),
    path: '/${dir.replace('(public)/', '').replace(/\[id\]$/, '123')}',${noIndexLine}
  });
}

export default function ${pageName}(): JSX.Element {
  return <${clientName} />;
}
`;
  writeFileSync(page, wrapper);
  console.log(`wrapped ${dir} (${titleKey} / ${subtitleKey}${opts?.noIndex ? ' noIndex' : ''})`);
}
