import { getServerCaller } from '@/lib/server-trpc';
import { SurpriseMeClient } from './SurpriseMeClient';
import type { SurpriseMePageData } from './SurpriseMeClient';

export default async function SurpriseMePage(): Promise<JSX.Element> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: SurpriseMePageData = { initialService: null as any };

  try {
    const caller = await getServerCaller();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const services = (await caller.services.list({ sort: 'popular', page: 1, limit: 50 })) as any;
    const items = services.items as unknown[];
    if (items.length > 0) {
      // Pick a random service on the server
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data.initialService = items[Math.floor(Math.random() * items.length)] as any;
    }
  } catch {
    // Client will retry
  }

  return <SurpriseMeClient data={data} />;
}
