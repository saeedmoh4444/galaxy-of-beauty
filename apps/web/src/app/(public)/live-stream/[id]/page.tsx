import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { LiveStreamDetailClient } from './LiveStreamDetailClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.live-stream.title', 'ar'),
    titleEn: t('marketing.live-stream.title', 'en'),
    descriptionAr: t('marketing.live-stream.subtitle', 'ar'),
    descriptionEn: t('marketing.live-stream.subtitle', 'en'),
    path: '/live-stream/123',
  });
}

export default function LiveStreamDetailPage(): JSX.Element {
  return <LiveStreamDetailClient />;
}
