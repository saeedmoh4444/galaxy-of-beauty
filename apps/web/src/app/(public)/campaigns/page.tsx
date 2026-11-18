import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { CampaignsClient } from './CampaignsClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.campaigns.title', 'ar'),
    titleEn: t('marketing.campaigns.title', 'en'),
    descriptionAr: t('marketing.campaigns.subtitle', 'ar'),
    descriptionEn: t('marketing.campaigns.subtitle', 'en'),
    path: 'C:/Program Files/Git/campaigns',
  });
}

export default function CampaignsPage(): JSX.Element {
  return <CampaignsClient />;
}
