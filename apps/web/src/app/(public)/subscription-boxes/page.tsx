import { getServerCaller, serializeForClient } from '@/lib/server-trpc';
import { PlansClient } from './PlansClient';
import type { PlansPageData } from './PlansClient';
import { getServerLocale } from '@/lib/i18n';
import { t } from '@galaxy/shared';

export default async function SubscriptionBoxesPage(): Promise<JSX.Element> {
  const locale = await getServerLocale();
  const data: PlansPageData = { plans: [] };

  try {
    const caller = await getServerCaller();
    const plans = await caller.subscriptionBoxes.plans();
    data.plans = serializeForClient(plans);
  } catch (e) {
    data.fetchError = (e as Error).message || t('marketing.subscription-boxes.load-error', locale);
  }

  return <PlansClient data={data} />;
}
