import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { ServiceTrendsClient } from './ServiceTrendsClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.service-trends.title', 'ar'),
    titleEn: t('marketing.service-trends.title', 'en'),
    descriptionAr: t('marketing.service-trends.subtitle', 'ar'),
    descriptionEn: t('marketing.service-trends.subtitle', 'en'),
    path: '/service-trends',
  });
}

export default function ServiceTrendsPage(): JSX.Element {
  return <ServiceTrendsClient />;
}
