import type { JSX } from 'react';
import { getServerCaller, serializeForClient } from '@/lib/server-trpc';
import { TechniciansClient } from './TechniciansClient';
import type { TechniciansPageData } from './TechniciansClient';
import { t } from '@galaxy/shared/i18n/web-server';
import { pageMeta } from '@/lib/seo';
import { getServerLocale } from '@/lib/i18n';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('nav.technicians', 'ar'),
    titleEn: t('nav.technicians', 'en'),
    descriptionAr: t('seo.page-description', 'ar'),
    descriptionEn: t('seo.page-description', 'en'),
    path: '/technicians',
  });
}

export default async function TechniciansPage(): Promise<JSX.Element> {
  const data: TechniciansPageData = { initialTechnicians: [] };

  try {
    const caller = await getServerCaller();
    const result = await caller.technicians.list({});
    data.initialTechnicians = serializeForClient(
      result,
    ) as unknown as TechniciansPageData['initialTechnicians'];
  } catch {
    // Client will retry on error
  }

  return <TechniciansClient data={data} />;
}
