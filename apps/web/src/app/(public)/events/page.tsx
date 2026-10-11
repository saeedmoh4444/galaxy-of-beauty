import type { JSX } from 'react';
import { getServerCaller, serializeForClient } from '@/lib/server-trpc';
import { EventsClient } from './EventsClient';
import { t } from '@galaxy/shared/i18n/web-server';
import { pageMeta } from '@/lib/seo';
import { getServerLocale } from '@/lib/i18n';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.events.title', 'ar'),
    titleEn: t('marketing.events.title', 'en'),
    descriptionAr: t('seo.page-description', 'ar'),
    descriptionEn: t('seo.page-description', 'en'),
    path: '/events',
  });
}

export default async function EventsPage(): Promise<JSX.Element> {
  let initialEvents: unknown[] = [];

  try {
    const caller = await getServerCaller();
    initialEvents = serializeForClient(
      await (
        caller as unknown as {
          beautyEvents: { list: (input: Record<string, never>) => Promise<unknown[]> };
        }
      ).beautyEvents.list({}),
    );
  } catch {
    /* client will retry */
  }

  return <EventsClient initialEvents={initialEvents} />;
}
