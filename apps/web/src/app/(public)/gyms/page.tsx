import type { JSX } from 'react';
import { getServerCaller, serializeForClient } from '@/lib/server-trpc';
import { GymsClient } from './GymsClient';
import type { GymsPageData } from './GymsClient';
import { getServerLocale } from '@/lib/i18n';
import { t } from '@galaxy/shared/i18n/web-server';
import { pageMeta } from '@/lib/seo';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('gyms.title', 'ar'),
    titleEn: t('gyms.title', 'en'),
    descriptionAr: t('gyms.subtitle', 'ar'),
    descriptionEn: t('gyms.subtitle', 'en'),
    path: '/gyms',
  });
}

export default async function GymsPage(): Promise<JSX.Element> {
  const locale = await getServerLocale();

  const data: GymsPageData = { gyms: [] };

  try {
    const caller = await getServerCaller();
    const result = await caller.gyms.list({ page: 1, limit: 50 });
    data.gyms = serializeForClient(result.items ?? []);
  } catch (e) {
    data.fetchError = (e as Error).message || t('gyms.load-error', locale);
  }

  return <GymsClient data={data} />;
}
