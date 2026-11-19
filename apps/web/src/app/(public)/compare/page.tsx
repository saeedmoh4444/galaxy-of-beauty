import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { CompareClient } from './CompareClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.compare.title', 'ar'),
    titleEn: t('marketing.compare.title', 'en'),
    descriptionAr: t('marketing.compare.subtitle', 'ar'),
    descriptionEn: t('marketing.compare.subtitle', 'en'),
    path: '/compare',
  });
}

export default function ComparePage(): JSX.Element {
  return <CompareClient />;
}
