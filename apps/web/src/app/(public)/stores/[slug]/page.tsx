import { getServerCaller, serializeForClient } from '@/lib/server-trpc';
import { StorefrontClient } from './StorefrontClient';
import type { StorefrontPageData } from './StorefrontClient';
import { getServerLocale } from '@/lib/i18n';
import { t } from '@galaxy/shared';

export default async function StorefrontPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<JSX.Element> {
  const { slug } = await params;
  const locale = await getServerLocale();

  const data: StorefrontPageData = { store: null, products: [], productCount: 0 };

  try {
    const caller = await getServerCaller();
    const vendor = await caller.marketplace.vendorDetail({ slug });
    if (vendor) {
      data.store = serializeForClient({
        id: vendor.id,
        storeName: vendor.storeName,
        storeSlug: vendor.storeSlug,
        descriptionJson: vendor.descriptionJson,
        logoUrl: vendor.logoUrl,
        bannerUrl: vendor.bannerUrl,
        isVerified: vendor.isVerified,
      }) as StorefrontPageData['store'];
      data.products = serializeForClient(vendor.products ?? []);
      data.productCount = vendor._count?.products ?? 0;
    }
  } catch {
    data.fetchError = t('stores.load-error', locale);
  }

  return <StorefrontClient data={data} />;
}
