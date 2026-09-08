import { getServerCaller, serializeForClient } from '@/lib/server-trpc';
import { NailBarClient } from './NailBarClient';
import type { NailBarPageData } from './NailBarClient';
import { getServerLocale } from '@/lib/i18n';
import { t } from '@galaxy/shared';

export default async function NailBarPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<JSX.Element> {
  const { slug } = await params;
  const locale = await getServerLocale();

  const data: NailBarPageData = { nailBar: null };

  try {
    const caller = await getServerCaller();
    const nailBar = await caller.nailBars.detail({ slug });
    if (nailBar) {
      data.nailBar = serializeForClient({
        id: nailBar.id,
        storeName: nailBar.storeName,
        storeSlug: nailBar.storeSlug,
        nailBarType: nailBar.nailBarType,
        nailBarCity: nailBar.nailBarCity,
        nailBarAddress: nailBar.nailBarAddress,
        licenseAgency: nailBar.licenseAgency,
        licenseVerifiedAt: nailBar.licenseVerifiedAt,
        descriptionJson: nailBar.descriptionJson,
        logoUrl: nailBar.logoUrl,
        ratingAvg: nailBar.ratingAvg,
        totalReviews: nailBar.totalReviews,
      }) as unknown as NailBarPageData['nailBar'];
    }
  } catch {
    data.fetchError = t('nailBars.load-error', locale);
  }

  return <NailBarClient data={data} />;
}
