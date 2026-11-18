import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { BeautyPodcastClient } from './BeautyPodcastClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.beauty-podcast.title', 'ar'),
    titleEn: t('marketing.beauty-podcast.title', 'en'),
    descriptionAr: t('marketing.beauty-podcast.subtitle', 'ar'),
    descriptionEn: t('marketing.beauty-podcast.subtitle', 'en'),
    path: '/beauty-podcast',
  });
}

export default function BeautyPodcastPage(): JSX.Element {
  return <BeautyPodcastClient />;
}
