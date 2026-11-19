import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { ApiDocsClient } from './ApiDocsClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.api-docs.title', 'ar'),
    titleEn: t('marketing.api-docs.title', 'en'),
    descriptionAr: t('marketing.api-docs.subtitle', 'ar'),
    descriptionEn: t('marketing.api-docs.subtitle', 'en'),
    path: '/api-docs',
  });
}

export default function ApiDocsPage(): JSX.Element {
  return <ApiDocsClient />;
}
