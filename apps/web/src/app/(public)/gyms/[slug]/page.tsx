import type { JSX } from 'react';
import { getServerCaller, serializeForClient } from '@/lib/server-trpc';
import { GymClient } from './GymClient';
import type { GymPageData } from './GymClient';
import { getServerLocale } from '@/lib/i18n';
import { t } from '@galaxy/shared/i18n/web-server';
import { pageMeta } from '@/lib/seo';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('gyms.title', 'ar'),
    titleEn: t('gyms.title', 'en'),
    descriptionAr: t('seo.page-description', 'ar'),
    descriptionEn: t('seo.page-description', 'en'),
    path: '/gyms/[slug]',
  });
}

export default async function GymPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<JSX.Element> {
  const { slug } = await params;
  const locale = await getServerLocale();

  const data: GymPageData = { gym: null, plans: [], dayPasses: [] };

  try {
    const caller = await getServerCaller();
    const gym = await caller.gyms.detail({ slug });
    if (gym) {
      data.gym = serializeForClient({
        id: gym.id,
        storeName: gym.storeName,
        storeSlug: gym.storeSlug,
        gymType: gym.gymType,
        gymCity: gym.gymCity,
        gymAddress: gym.gymAddress,
        licenseAgency: gym.licenseAgency,
        licenseVerifiedAt: gym.licenseVerifiedAt,
        descriptionJson: gym.descriptionJson,
        logoUrl: gym.logoUrl,
        ratingAvg: gym.ratingAvg,
        totalReviews: gym.totalReviews,
        womenOnlyStaff: gym.womenOnlyStaff,
        privateSuite: gym.privateSuite,
      }) as unknown as GymPageData['gym'];
      data.plans = serializeForClient(gym.plans ?? []);
      data.dayPasses = serializeForClient(gym.dayPasses ?? []);
    }
  } catch {
    data.fetchError = t('gyms.load-error', locale);
  }

  return <GymClient data={data} />;
}
