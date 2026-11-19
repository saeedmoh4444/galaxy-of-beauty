import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { IngredientAnalyzerClient } from './IngredientAnalyzerClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.ingredient-analyzer.title', 'ar'),
    titleEn: t('marketing.ingredient-analyzer.title', 'en'),
    descriptionAr: t('marketing.ingredient-analyzer.subtitle', 'ar'),
    descriptionEn: t('marketing.ingredient-analyzer.subtitle', 'en'),
    path: '/ingredient-analyzer',
  });
}

export default function IngredientAnalyzerPage(): JSX.Element {
  return <IngredientAnalyzerClient />;
}
