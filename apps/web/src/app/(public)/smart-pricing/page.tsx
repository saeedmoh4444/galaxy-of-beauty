import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { SmartPricingClient } from './SmartPricingClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.smart-pricing.title', 'ar'),
    titleEn: t('marketing.smart-pricing.title', 'en'),
    descriptionAr: t('marketing.smart-pricing.subtitle', 'ar'),
    descriptionEn: t('marketing.smart-pricing.subtitle', 'en'),
    path: '/smart-pricing',
  });
}

export default function SmartPricingPage(): JSX.Element {
  return <SmartPricingClient />;
}
