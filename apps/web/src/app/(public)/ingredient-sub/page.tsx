import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { IngredientSubClient } from './IngredientSubClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.ingredient-sub.title', 'ar'),
    titleEn: t('marketing.ingredient-sub.title', 'en'),
    descriptionAr: t('marketing.ingredient-sub.subtitle', 'ar'),
    descriptionEn: t('marketing.ingredient-sub.subtitle', 'en'),
    path: '/ingredient-sub',
  });
}

export default function IngredientSubPage(): JSX.Element {
  return <IngredientSubClient />;
}
