import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { TechnicianBadgesClient } from './TechnicianBadgesClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.technician-badges.title', 'ar'),
    titleEn: t('marketing.technician-badges.title', 'en'),
    descriptionAr: t('marketing.technician-badges.subtitle', 'ar'),
    descriptionEn: t('marketing.technician-badges.subtitle', 'en'),
    path: '/technician-badges',
  });
}

export default function TechnicianBadgesPage(): JSX.Element {
  return <TechnicianBadgesClient />;
}
