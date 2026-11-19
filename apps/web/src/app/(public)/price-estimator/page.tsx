import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { PriceEstimatorClient } from './PriceEstimatorClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.price-estimator.title', 'ar'),
    titleEn: t('marketing.price-estimator.title', 'en'),
    descriptionAr: t('marketing.price-estimator.subtitle', 'ar'),
    descriptionEn: t('marketing.price-estimator.subtitle', 'en'),
    path: '/price-estimator',
  });
}

export default function PriceEstimatorPage(): JSX.Element {
  return <PriceEstimatorClient />;
}
