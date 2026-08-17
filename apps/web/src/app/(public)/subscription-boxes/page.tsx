import { getServerCaller } from '@/lib/server-trpc';
import { PlansClient } from './PlansClient';
import type { PlansPageData } from './PlansClient';

export default async function SubscriptionBoxesPage(): Promise<JSX.Element> {
  const data: PlansPageData = { plans: [] };

  try {
    const caller = await getServerCaller();
    const plans = await caller.subscriptionBoxes.plans();
    data.plans = plans;
  } catch (e) {
    data.fetchError = (e as Error).message || 'فشل تحميل الباقات';
  }

  return <PlansClient data={data} />;
}
