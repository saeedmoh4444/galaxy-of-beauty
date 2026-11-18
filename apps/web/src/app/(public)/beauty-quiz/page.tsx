import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { BeautyQuizClient } from './BeautyQuizClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.beauty-quiz.title', 'ar'),
    titleEn: t('marketing.beauty-quiz.title', 'en'),
    descriptionAr: t('marketing.beauty-quiz.subtitle', 'ar'),
    descriptionEn: t('marketing.beauty-quiz.subtitle', 'en'),
    path: '/beauty-quiz',
  });
}

export default function BeautyQuizPage(): JSX.Element {
  return <BeautyQuizClient />;
}
