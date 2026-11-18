import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { GroupBuyClient } from './GroupBuyClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.group-buy.title', 'ar'),
    titleEn: t('marketing.group-buy.title', 'en'),
    descriptionAr: t('marketing.group-buy.subtitle', 'ar'),
    descriptionEn: t('marketing.group-buy.subtitle', 'en'),
    path: 'C:/Program Files/Git/group-buy',
  });
}

export default function GroupBuyPage(): JSX.Element {
  return <GroupBuyClient />;
}
