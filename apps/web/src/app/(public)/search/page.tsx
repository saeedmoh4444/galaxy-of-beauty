import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { SearchClient } from './SearchClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.search.title', 'ar'),
    titleEn: t('marketing.search.title', 'en'),
    descriptionAr: t('marketing.search.subtitle', 'ar'),
    descriptionEn: t('marketing.search.subtitle', 'en'),
    path: '/search',
  });
}

export default function SearchPage(): JSX.Element {
  return <SearchClient />;
}
