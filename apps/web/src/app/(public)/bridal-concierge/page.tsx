import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { BridalConciergeClient } from './BridalConciergeClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.bridal-concierge.landing-title', 'ar'),
    titleEn: t('marketing.bridal-concierge.landing-title', 'en'),
    descriptionAr: t('marketing.bridal-concierge.landing-subtitle', 'ar'),
    descriptionEn: t('marketing.bridal-concierge.landing-subtitle', 'en'),
    path: 'C:/Program Files/Git/bridal-concierge',
  });
}

export default function BridalConciergePage(): JSX.Element {
  return <BridalConciergeClient />;
}
