/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerCaller, serializeForClient } from '@/lib/server-trpc';
import { MarketplaceClient } from './MarketplaceClient';

export default async function MarketplacePage(): Promise<JSX.Element> {
  let initialProducts: any[] = [];
  let initialTotal = 0;

  try {
    const caller = await getServerCaller();
    const result = await caller.marketplace.products({
      sortBy: 'newest',
      page: 1,
      limit: 20,
    }) as any;
    initialProducts = serializeForClient(result.items ?? []);
    initialTotal = serializeForClient(result.total ?? 0);
  } catch {
    // Client will retry with client-side queries on error
  }

  return (
    <MarketplaceClient
      initialProducts={initialProducts}
      initialTotal={initialTotal}
    />
  );
}
