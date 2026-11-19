import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { BeautyShortsClient } from './BeautyShortsClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('beautyShorts.title', 'ar'),
    titleEn: t('beautyShorts.title', 'en'),
    descriptionAr: t('marketing.beauty-shorts.subtitle', 'ar'),
    descriptionEn: t('marketing.beauty-shorts.subtitle', 'en'),
    path: '/beauty-shorts',
  });
}

export default function BeautyShortsPage(): JSX.Element {
  return <BeautyShortsClient />;
}
