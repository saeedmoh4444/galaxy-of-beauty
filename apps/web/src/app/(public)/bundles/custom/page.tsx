import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { BundlesCustomClient } from './BundlesCustomClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.bundles.title', 'ar'),
    titleEn: t('marketing.bundles.title', 'en'),
    descriptionAr: t('marketing.bundles.subtitle', 'ar'),
    descriptionEn: t('marketing.bundles.subtitle', 'en'),
    path: '/bundles/custom',
  });
}

export default function BundlesPage(): JSX.Element {
  return <BundlesCustomClient />;
}
