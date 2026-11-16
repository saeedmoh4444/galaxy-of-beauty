import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { GiftGuideClient } from './GiftGuideClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.gift-guide.title', 'ar'),
    titleEn: t('marketing.gift-guide.title', 'en'),
    descriptionAr: t('marketing.gift-guide.subtitle', 'ar'),
    descriptionEn: t('marketing.gift-guide.subtitle', 'en'),
    path: 'C:/Program Files/Git/gift-guide',
  });
}

export default function GiftGuidePage(): JSX.Element {
  return <GiftGuideClient />;
}
