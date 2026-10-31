import type { JSX } from 'react';
import { getServerCaller, serializeForClient } from '@/lib/server-trpc';
import { ServicesClient } from './ServicesClient';
import type { ServicesPageData } from './ServicesClient';
import { t } from '@galaxy/shared/i18n/web-server';
import { pageMeta } from '@/lib/seo';
import { getServerLocale } from '@/lib/i18n';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.services.title', 'ar'),
    titleEn: t('marketing.services.title', 'en'),
    descriptionAr: t('marketing.services.subtitle', 'ar'),
    descriptionEn: t('marketing.services.subtitle', 'en'),
    path: '/services',
  });
}

export default async function ServicesPage({
  searchParams,
}: {
  searchParams?: Promise<{ categoryId?: string }>;
}): Promise<JSX.Element> {
  // E2 — the ?categoryId= chip links were never read (the client ignored
  // them and the SSR fetch ignored them); filter the initial data by the
  // same param the client query uses.
  const params = await searchParams;
  const categoryId = params?.categoryId ? Number(params.categoryId) : undefined;

  const data: ServicesPageData = {
    initialServices: [],
    initialCategories: [],
    initialTotal: 0,
  };

  try {
    const caller = await getServerCaller();
    const [svcResult, categories] = await Promise.all([
      caller.services.list({
        sort: 'newest',
        page: 1,
        limit: 12,
        ...(categoryId ? { categoryId } : {}),
      }),
      caller.categories.list(),
    ]);

    data.initialServices = serializeForClient(svcResult.items);
    data.initialTotal = svcResult.total;
    data.initialCategories = serializeForClient(categories);
  } catch {
    // Client will retry with client-side queries on error
  }

  return <ServicesClient data={data} />;
}
