import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { OfflineClient } from './OfflineClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('offline.title', 'ar'),
    titleEn: t('offline.title', 'en'),
    descriptionAr: t('offline.desc', 'ar'),
    descriptionEn: t('offline.desc', 'en'),
    path: '/offline',
    noIndex: true,
  });
}

export default function OfflinePage(): JSX.Element {
  return <OfflineClient />;
}
