import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { ProductCompareClient } from './ProductCompareClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.product-compare.title', 'ar'),
    titleEn: t('marketing.product-compare.title', 'en'),
    descriptionAr: t('marketing.product-compare.subtitle', 'ar'),
    descriptionEn: t('marketing.product-compare.subtitle', 'en'),
    path: '/product-compare',
  });
}

export default function ProductComparePage(): JSX.Element {
  return <ProductCompareClient />;
}
