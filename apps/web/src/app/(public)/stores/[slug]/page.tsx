import type { JSX } from 'react';
import { getServerCaller, serializeForClient } from '@/lib/server-trpc';
import { StorefrontClient } from './StorefrontClient';
import type { StorefrontPageData } from './StorefrontClient';
import { getServerLocale } from '@/lib/i18n';
import { t } from '@galaxy/shared/i18n/web-server';
import { pageMeta } from '@/lib/seo';
import type { Metadata } from 'next';

// F4 — per-store metadata: name, About description, banner as og:image,
// canonical URL. Falls back to the generic stores meta when the vendor
// is missing or the lookup fails.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getServerLocale();
  try {
    const caller = await getServerCaller();
    const vendor = await caller.marketplace.vendorDetail({ slug });
    if (vendor) {
      const desc = (vendor.descriptionJson as { ar?: string; en?: string } | null) ?? {};
      return pageMeta({
        locale,
        titleAr: vendor.storeName,
        titleEn: vendor.storeName,
        descriptionAr: desc.ar || t('seo.page-description', 'ar'),
        descriptionEn: desc.en || t('seo.page-description', 'en'),
        path: `/stores/${vendor.storeSlug}`,
        imagePath: vendor.bannerUrl ?? undefined,
      });
    }
  } catch {
    // fall through to the generic meta
  }
  return pageMeta({
    locale,
    titleAr: t('stores.title', 'ar'),
    titleEn: t('stores.title', 'en'),
    descriptionAr: t('seo.page-description', 'ar'),
    descriptionEn: t('seo.page-description', 'en'),
    path: '/stores/[slug]',
  });
}

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
        ratingAvg: vendor.ratingAvg ? Number(vendor.ratingAvg) : null,
        totalReviews: vendor.totalReviews,
        socialLinks: vendor.socialLinks,
        tierBadges: vendor.tierBadges,
        recentReviews: vendor.recentReviews,
      }) as StorefrontPageData['store'];
      data.products = serializeForClient(vendor.products ?? []);
      data.productCount = vendor._count?.products ?? 0;
    }
  } catch {
    data.fetchError = t('stores.load-error', locale);
  }

  return <StorefrontClient data={data} />;
}
