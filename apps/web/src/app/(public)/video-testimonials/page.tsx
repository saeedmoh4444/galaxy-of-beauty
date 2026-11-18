import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { VideoTestimonialsClient } from './VideoTestimonialsClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.video-testimonials.title', 'ar'),
    titleEn: t('marketing.video-testimonials.title', 'en'),
    descriptionAr: t('marketing.video-testimonials.subtitle', 'ar'),
    descriptionEn: t('marketing.video-testimonials.subtitle', 'en'),
    path: '/video-testimonials',
  });
}

export default function VideoTestimonialsPage(): JSX.Element {
  return <VideoTestimonialsClient />;
}
