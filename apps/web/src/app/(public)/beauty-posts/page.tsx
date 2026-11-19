import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { BeautyPostsClient } from './BeautyPostsClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('beautyPosts.title', 'ar'),
    titleEn: t('beautyPosts.title', 'en'),
    descriptionAr: t('beautyPosts.subtitle', 'ar'),
    descriptionEn: t('beautyPosts.subtitle', 'en'),
    path: '/beauty-posts',
  });
}

export default function BeautyPostsPage(): JSX.Element {
  return <BeautyPostsClient />;
}
