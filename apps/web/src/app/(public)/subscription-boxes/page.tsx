import type { JSX } from 'react';
import { getServerCaller, serializeForClient } from '@/lib/server-trpc';
import { PlansClient } from './PlansClient';
import type { PlansPageData } from './PlansClient';
import { getServerLocale } from '@/lib/i18n';
import { t } from '@galaxy/shared/i18n/web-server';
import { pageMeta } from '@/lib/seo';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.subscription-boxes.title', 'ar'),
    titleEn: t('marketing.subscription-boxes.title', 'en'),
    descriptionAr: t('marketing.subscription-boxes.subtitle', 'ar'),
    descriptionEn: t('marketing.subscription-boxes.subtitle', 'en'),
    path: '/subscription-boxes',
  });
}

export default async function SubscriptionBoxesPage(): Promise<JSX.Element> {
  const locale = await getServerLocale();
  const data: PlansPageData = { plans: [] };

  try {
    const caller = await getServerCaller();
    const plans = await caller.subscriptionBoxes.plans();
    data.plans = serializeForClient(plans);
  } catch (e) {
    data.fetchError = (e as Error).message || t('marketing.subscription-boxes.load-error', locale);
  }

  return <PlansClient data={data} />;
}
