import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { ServiceRecommenderClient } from './ServiceRecommenderClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.service-recommender.title', 'ar'),
    titleEn: t('marketing.service-recommender.title', 'en'),
    descriptionAr: t('marketing.service-recommender.subtitle', 'ar'),
    descriptionEn: t('marketing.service-recommender.subtitle', 'en'),
    path: '/service-recommender',
  });
}

export default function ServiceRecommenderPage(): JSX.Element {
  return <ServiceRecommenderClient />;
}
