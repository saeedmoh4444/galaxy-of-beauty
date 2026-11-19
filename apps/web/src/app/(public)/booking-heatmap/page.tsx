import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { BookingHeatmapClient } from './BookingHeatmapClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.booking-heatmap.title', 'ar'),
    titleEn: t('marketing.booking-heatmap.title', 'en'),
    descriptionAr: t('marketing.booking-heatmap.subtitle', 'ar'),
    descriptionEn: t('marketing.booking-heatmap.subtitle', 'en'),
    path: '/booking-heatmap',
  });
}

export default function BookingHeatmapPage(): JSX.Element {
  return <BookingHeatmapClient />;
}
