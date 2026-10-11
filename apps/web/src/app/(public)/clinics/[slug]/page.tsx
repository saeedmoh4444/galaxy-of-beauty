import type { JSX } from 'react';
import { getServerCaller, serializeForClient } from '@/lib/server-trpc';
import { ClinicClient } from './ClinicClient';
import type { ClinicPageData } from './ClinicClient';
import { getServerLocale } from '@/lib/i18n';
import { t } from '@galaxy/shared/i18n/web-server';
import { pageMeta } from '@/lib/seo';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('clinics.title', 'ar'),
    titleEn: t('clinics.title', 'en'),
    descriptionAr: t('seo.page-description', 'ar'),
    descriptionEn: t('seo.page-description', 'en'),
    path: '/clinics/[slug]',
  });
}

export default async function ClinicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<JSX.Element> {
  const { slug } = await params;
  const locale = await getServerLocale();

  const data: ClinicPageData = { clinic: null, packages: [] };

  try {
    const caller = await getServerCaller();
    const clinic = await caller.clinics.detail({ slug });
    if (clinic) {
      data.clinic = serializeForClient({
        id: clinic.id,
        storeName: clinic.storeName,
        storeSlug: clinic.storeSlug,
        clinicType: clinic.clinicType,
        licenseAgency: clinic.licenseAgency,
        licenseNumber: clinic.licenseNumber,
        licenseVerifiedAt: clinic.licenseVerifiedAt,
        consultationPrice: clinic.consultationPrice,
        descriptionJson: clinic.descriptionJson,
        logoUrl: clinic.logoUrl,
        ratingAvg: clinic.ratingAvg,
        totalReviews: clinic.totalReviews,
      }) as unknown as ClinicPageData['clinic'];
      data.packages = serializeForClient(clinic.packages ?? []);
    }
  } catch {
    data.fetchError = t('clinics.load-error', locale);
  }

  return <ClinicClient data={data} />;
}
