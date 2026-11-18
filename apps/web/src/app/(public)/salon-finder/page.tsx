import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { SalonFinderClient } from './SalonFinderClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.salon-finder.title', 'ar'),
    titleEn: t('marketing.salon-finder.title', 'en'),
    descriptionAr: t('marketing.salon-finder.subtitle', 'ar'),
    descriptionEn: t('marketing.salon-finder.subtitle', 'en'),
    path: 'C:/Program Files/Git/salon-finder',
  });
}

export default function SalonFinderPage(): JSX.Element {
  return <SalonFinderClient />;
}
