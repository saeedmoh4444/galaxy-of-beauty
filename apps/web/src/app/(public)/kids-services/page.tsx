import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { KidsServicesClient } from './KidsServicesClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.kids-services.title', 'ar'),
    titleEn: t('marketing.kids-services.title', 'en'),
    descriptionAr: t('marketing.kids-services.subtitle', 'ar'),
    descriptionEn: t('marketing.kids-services.subtitle', 'en'),
    path: 'C:/Program Files/Git/kids-services',
  });
}

export default function KidsServicesPage(): JSX.Element {
  return <KidsServicesClient />;
}
