import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { TrendingClient } from './TrendingClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.trending.title', 'ar'),
    titleEn: t('marketing.trending.title', 'en'),
    descriptionAr: t('marketing.trending.subtitle', 'ar'),
    descriptionEn: t('marketing.trending.subtitle', 'en'),
    path: 'C:/Program Files/Git/trending',
  });
}

export default function TrendingPage(): JSX.Element {
  return <TrendingClient />;
}
