import type { JSX } from 'react';
import { getServerCaller, serializeForClient } from '@/lib/server-trpc';
import { SurpriseMeClient } from './SurpriseMeClient';
import type { SurpriseMePageData } from './SurpriseMeClient';
import { t } from '@galaxy/shared/i18n/web-server';
import { pageMeta } from '@/lib/seo';
import { getServerLocale } from '@/lib/i18n';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.services.surprise-me', 'ar'),
    titleEn: t('marketing.services.surprise-me', 'en'),
    descriptionAr: t('seo.page-description', 'ar'),
    descriptionEn: t('seo.page-description', 'en'),
    path: '/services/surprise-me',
  });
}

export default async function SurpriseMePage(): Promise<JSX.Element> {
  const data: SurpriseMePageData = { initialService: null };

  try {
    const caller = await getServerCaller();
    const services = await caller.services.list({ sort: 'popular', page: 1, limit: 50 });
    const items = services.items;
    if (items.length > 0) {
      // Pick a random service on the server
      data.initialService = serializeForClient(items[Math.floor(Math.random() * items.length)]!);
    }
  } catch {
    // Client will retry
  }

  return <SurpriseMeClient data={data} />;
}
