import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { BeautyAwardsClient } from './BeautyAwardsClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.beauty-awards.title', 'ar'),
    titleEn: t('marketing.beauty-awards.title', 'en'),
    descriptionAr: t('marketing.beauty-awards.subtitle', 'ar'),
    descriptionEn: t('marketing.beauty-awards.subtitle', 'en'),
    path: '/beauty-awards',
  });
}

export default function BeautyAwardsPage(): JSX.Element {
  return <BeautyAwardsClient />;
}
