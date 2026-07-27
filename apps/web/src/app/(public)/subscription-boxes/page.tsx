import { getServerCaller } from '@/lib/server-trpc';
import { PlansClient } from './PlansClient';
import type { PlansPageData } from './PlansClient';

export default async function SubscriptionBoxesPage(): Promise<JSX.Element> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: PlansPageData = { plans: [] as any[] };

  try {
    const caller = await getServerCaller();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const plans = (await caller.subscriptionBoxes.plans({})) as any[];
    data.plans = plans;
  } catch (e) {
    data.fetchError = (e as Error).message || 'فشل تحميل الباقات';
  }

  return <PlansClient data={data} />;
}
