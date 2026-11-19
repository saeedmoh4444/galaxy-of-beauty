import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { BeautyFortuneClient } from './BeautyFortuneClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.beauty-fortune.title', 'ar'),
    titleEn: t('marketing.beauty-fortune.title', 'en'),
    descriptionAr: t('marketing.beauty-fortune.subtitle', 'ar'),
    descriptionEn: t('marketing.beauty-fortune.subtitle', 'en'),
    path: '/beauty-fortune',
  });
}

export default function BeautyFortunePage(): JSX.Element {
  return <BeautyFortuneClient />;
}
