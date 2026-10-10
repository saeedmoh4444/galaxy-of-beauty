import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { FlashDealsClient } from './FlashDealsClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.flash-deals.title', 'ar'),
    titleEn: t('marketing.flash-deals.title', 'en'),
    descriptionAr: t('marketing.flash-deals.subtitle', 'ar'),
    descriptionEn: t('marketing.flash-deals.subtitle', 'en'),
    path: '/flash-deals',
  });
}

export default function FlashDealsPage(): JSX.Element {
  return <FlashDealsClient />;
}
