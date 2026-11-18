import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { PregnancyBeautyClient } from './PregnancyBeautyClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.pregnancy-beauty.title', 'ar'),
    titleEn: t('marketing.pregnancy-beauty.title', 'en'),
    descriptionAr: t('marketing.pregnancy-beauty.subtitle', 'ar'),
    descriptionEn: t('marketing.pregnancy-beauty.subtitle', 'en'),
    path: 'C:/Program Files/Git/pregnancy-beauty',
  });
}

export default function PregnancyBeautyPage(): JSX.Element {
  return <PregnancyBeautyClient />;
}
