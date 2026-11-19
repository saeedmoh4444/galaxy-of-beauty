import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { BeautyExpoClient } from './BeautyExpoClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.beauty-expo.title', 'ar'),
    titleEn: t('marketing.beauty-expo.title', 'en'),
    descriptionAr: t('marketing.beauty-expo.subtitle', 'ar'),
    descriptionEn: t('marketing.beauty-expo.subtitle', 'en'),
    path: '/beauty-expo',
  });
}

export default function BeautyExpoPage(): JSX.Element {
  return <BeautyExpoClient />;
}
