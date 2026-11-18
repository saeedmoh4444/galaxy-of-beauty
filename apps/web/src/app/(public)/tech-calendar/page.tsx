import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { TechCalendarClient } from './TechCalendarClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.tech-calendar.title', 'ar'),
    titleEn: t('marketing.tech-calendar.title', 'en'),
    descriptionAr: t('marketing.tech-calendar.subtitle', 'ar'),
    descriptionEn: t('marketing.tech-calendar.subtitle', 'en'),
    path: '/tech-calendar',
  });
}

export default function TechCalendarPage(): JSX.Element {
  return <TechCalendarClient />;
}
