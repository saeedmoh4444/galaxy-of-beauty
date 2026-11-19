import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { GiftQuizClient } from './GiftQuizClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.gift-quiz.title', 'ar'),
    titleEn: t('marketing.gift-quiz.title', 'en'),
    descriptionAr: t('marketing.gift-quiz.subtitle', 'ar'),
    descriptionEn: t('marketing.gift-quiz.subtitle', 'en'),
    path: '/gift-quiz',
  });
}

export default function GiftQuizPage(): JSX.Element {
  return <GiftQuizClient />;
}
