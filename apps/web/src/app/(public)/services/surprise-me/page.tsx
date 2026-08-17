import { getServerCaller } from '@/lib/server-trpc';
import { SurpriseMeClient } from './SurpriseMeClient';
import type { SurpriseMePageData } from './SurpriseMeClient';

export default async function SurpriseMePage(): Promise<JSX.Element> {
  const data: SurpriseMePageData = { initialService: null };

  try {
    const caller = await getServerCaller();
    const services = await caller.services.list({ sort: 'popular', page: 1, limit: 50 });
    const items = services.items;
    if (items.length > 0) {
      // Pick a random service on the server
      data.initialService = items[Math.floor(Math.random() * items.length)];
    }
  } catch {
    // Client will retry
  }

  return <SurpriseMeClient data={data} />;
}
