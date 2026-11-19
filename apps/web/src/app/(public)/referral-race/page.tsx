import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { ReferralRaceClient } from './ReferralRaceClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.referral-race.title', 'ar'),
    titleEn: t('marketing.referral-race.title', 'en'),
    descriptionAr: t('marketing.referral-race.subtitle', 'ar'),
    descriptionEn: t('marketing.referral-race.subtitle', 'en'),
    path: '/referral-race',
  });
}

export default function ReferralRacePage(): JSX.Element {
  return <ReferralRaceClient />;
}
