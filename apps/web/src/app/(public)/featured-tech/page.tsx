import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { FeaturedTechClient } from './FeaturedTechClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.featured-tech.title', 'ar'),
    titleEn: t('marketing.featured-tech.title', 'en'),
    descriptionAr: t('marketing.featured-tech.subtitle', 'ar'),
    descriptionEn: t('marketing.featured-tech.subtitle', 'en'),
    path: '/featured-tech',
  });
}

export default function FeaturedTechPage(): JSX.Element {
  return <FeaturedTechClient />;
}
