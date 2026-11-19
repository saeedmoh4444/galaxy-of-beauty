import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { StatusClient } from './StatusClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('status.title', 'ar'),
    titleEn: t('status.title', 'en'),
    descriptionAr: t('status.subtitle', 'ar'),
    descriptionEn: t('status.subtitle', 'en'),
    path: '/status',
  });
}

export default function StatusPage(): JSX.Element {
  return <StatusClient />;
}
