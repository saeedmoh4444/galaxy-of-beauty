import type { JSX } from 'react';
import { getServerCaller, serializeForClient } from '@/lib/server-trpc';
import { BarberettesClient } from './BarberettesClient';
import type { BarberettesPageData } from './BarberettesClient';
import { getServerLocale } from '@/lib/i18n';
import { t } from '@galaxy/shared/i18n/web-server';
import { pageMeta } from '@/lib/seo';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('barberettes.title', 'ar'),
    titleEn: t('barberettes.title', 'en'),
    descriptionAr: t('barberettes.subtitle', 'ar'),
    descriptionEn: t('barberettes.subtitle', 'en'),
    path: '/barberettes',
  });
}

export default async function BarberettesPage(): Promise<JSX.Element> {
  const locale = await getServerLocale();

  const data: BarberettesPageData = { barberettes: [] };

  try {
    const caller = await getServerCaller();
    const result = await caller.technicians.barberettes();
    data.barberettes = serializeForClient(result ?? []);
  } catch (e) {
    data.fetchError = (e as Error).message || t('barberettes.load-error', locale);
  }

  return <BarberettesClient data={data} />;
}
