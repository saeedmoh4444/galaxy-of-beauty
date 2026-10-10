import type { JSX } from 'react';
import { getServerCaller, serializeForClient } from '@/lib/server-trpc';
import { ClinicsClient } from './ClinicsClient';
import type { ClinicsPageData } from './ClinicsClient';
import { getServerLocale } from '@/lib/i18n';
import { t } from '@galaxy/shared/i18n/web-server';
import { pageMeta } from '@/lib/seo';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('clinics.title', 'ar'),
    titleEn: t('clinics.title', 'en'),
    descriptionAr: t('clinics.subtitle', 'ar'),
    descriptionEn: t('clinics.subtitle', 'en'),
    path: '/clinics',
  });
}

export default async function ClinicsPage(): Promise<JSX.Element> {
  const locale = await getServerLocale();

  const data: ClinicsPageData = { clinics: [] };

  try {
    const caller = await getServerCaller();
    const result = await caller.clinics.list({ page: 1, limit: 50 });
    data.clinics = serializeForClient(result.items ?? []);
  } catch (e) {
    data.fetchError = (e as Error).message || t('clinics.load-error', locale);
  }

  return <ClinicsClient data={data} />;
}
