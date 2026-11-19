import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { TechnicianCompareClient } from './TechnicianCompareClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.technician-compare.title', 'ar'),
    titleEn: t('marketing.technician-compare.title', 'en'),
    descriptionAr: t('marketing.technician-compare.subtitle', 'ar'),
    descriptionEn: t('marketing.technician-compare.subtitle', 'en'),
    path: '/technician-compare',
  });
}

export default function TechnicianComparePage(): JSX.Element {
  return <TechnicianCompareClient />;
}
