import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { EventTicketsClient } from './EventTicketsClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.event-tickets.title', 'ar'),
    titleEn: t('marketing.event-tickets.title', 'en'),
    descriptionAr: t('marketing.event-tickets.subtitle', 'ar'),
    descriptionEn: t('marketing.event-tickets.subtitle', 'en'),
    path: '/event-tickets',
  });
}

export default function EventTicketsPage(): JSX.Element {
  return <EventTicketsClient />;
}
