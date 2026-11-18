import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { DiscoverClient } from './DiscoverClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.discover.header-title', 'ar'),
    titleEn: t('marketing.discover.header-title', 'en'),
    descriptionAr: t('marketing.discover.header-subtitle', 'ar'),
    descriptionEn: t('marketing.discover.header-subtitle', 'en'),
    path: 'C:/Program Files/Git/discover',
  });
}

export default function DiscoverPage(): JSX.Element {
  return <DiscoverClient />;
}
