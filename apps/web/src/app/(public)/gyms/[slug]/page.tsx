import { getServerCaller, serializeForClient } from '@/lib/server-trpc';
import { GymClient } from './GymClient';
import type { GymPageData } from './GymClient';
import { getServerLocale } from '@/lib/i18n';
import { t } from '@galaxy/shared';

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
      }) as unknown as GymPageData['gym'];
      data.plans = serializeForClient(gym.plans ?? []);
      data.dayPasses = serializeForClient(gym.dayPasses ?? []);
    }
  } catch {
    data.fetchError = t('gyms.load-error', locale);
  }

  return <GymClient data={data} />;
}
