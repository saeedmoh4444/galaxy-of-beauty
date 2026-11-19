import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { TechLeaderboardClient } from './TechLeaderboardClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.tech-leaderboard.title', 'ar'),
    titleEn: t('marketing.tech-leaderboard.title', 'en'),
    descriptionAr: t('marketing.tech-leaderboard.subtitle', 'ar'),
    descriptionEn: t('marketing.tech-leaderboard.subtitle', 'en'),
    path: '/tech-leaderboard',
  });
}

export default function TechLeaderboardPage(): JSX.Element {
  return <TechLeaderboardClient />;
}
