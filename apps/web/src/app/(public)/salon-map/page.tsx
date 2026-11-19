import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { SalonMapClient } from './SalonMapClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.salon-map.title', 'ar'),
    titleEn: t('marketing.salon-map.title', 'en'),
    descriptionAr: t('marketing.salon-map.subtitle', 'ar'),
    descriptionEn: t('marketing.salon-map.subtitle', 'en'),
    path: '/salon-map',
  });
}

export default function SalonMapPage(): JSX.Element {
  return <SalonMapClient />;
}
