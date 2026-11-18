import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { WomensServicesClient } from './WomensServicesClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.womens-services.title', 'ar'),
    titleEn: t('marketing.womens-services.title', 'en'),
    descriptionAr: t('marketing.womens-services.subtitle', 'ar'),
    descriptionEn: t('marketing.womens-services.subtitle', 'en'),
    path: 'C:/Program Files/Git/womens-services',
  });
}

export default function WomensServicesPage(): JSX.Element {
  return <WomensServicesClient />;
}
