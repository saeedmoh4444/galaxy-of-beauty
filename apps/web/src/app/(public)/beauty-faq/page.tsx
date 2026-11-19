import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { BeautyFaqClient } from './BeautyFaqClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.beauty-faq.title', 'ar'),
    titleEn: t('marketing.beauty-faq.title', 'en'),
    descriptionAr: t('marketing.beauty-faq.subtitle', 'ar'),
    descriptionEn: t('marketing.beauty-faq.subtitle', 'en'),
    path: '/beauty-faq',
  });
}

export default function BeautyFaqPage(): JSX.Element {
  return <BeautyFaqClient />;
}
