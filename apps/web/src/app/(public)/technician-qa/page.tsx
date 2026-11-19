import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { TechnicianQAClient } from './TechnicianQAClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.technician-qa.title', 'ar'),
    titleEn: t('marketing.technician-qa.title', 'en'),
    descriptionAr: t('marketing.technician-qa.subtitle', 'ar'),
    descriptionEn: t('marketing.technician-qa.subtitle', 'en'),
    path: '/technician-qa',
  });
}

export default function TechnicianQAPage(): JSX.Element {
  return <TechnicianQAClient />;
}
