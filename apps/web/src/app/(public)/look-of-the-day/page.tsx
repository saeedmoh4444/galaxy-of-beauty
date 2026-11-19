import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { LookOfTheDayClient } from './LookOfTheDayClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.look-of-the-day.title', 'ar'),
    titleEn: t('marketing.look-of-the-day.title', 'en'),
    descriptionAr: t('marketing.look-of-the-day.subtitle', 'ar'),
    descriptionEn: t('marketing.look-of-the-day.subtitle', 'en'),
    path: '/look-of-the-day',
  });
}

export default function LookOfTheDayPage(): JSX.Element {
  return <LookOfTheDayClient />;
}
