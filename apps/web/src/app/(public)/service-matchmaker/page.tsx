import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { ServiceMatchmakerClient } from './ServiceMatchmakerClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.service-matchmaker.title', 'ar'),
    titleEn: t('marketing.service-matchmaker.title', 'en'),
    descriptionAr: t('marketing.service-matchmaker.subtitle', 'ar'),
    descriptionEn: t('marketing.service-matchmaker.subtitle', 'en'),
    path: '/service-matchmaker',
  });
}

export default function ServiceMatchmakerPage(): JSX.Element {
  return <ServiceMatchmakerClient />;
}
