import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { BeautyStoriesClient } from './BeautyStoriesClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.beauty-stories.title', 'ar'),
    titleEn: t('marketing.beauty-stories.title', 'en'),
    descriptionAr: t('marketing.beauty-stories.subtitle', 'ar'),
    descriptionEn: t('marketing.beauty-stories.subtitle', 'en'),
    path: '/beauty-stories',
  });
}

export default function BeautyStoriesPage(): JSX.Element {
  return <BeautyStoriesClient />;
}
