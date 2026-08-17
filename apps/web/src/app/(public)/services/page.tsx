import { getServerCaller } from '@/lib/server-trpc';
import { ServicesClient } from './ServicesClient';
import type { ServicesPageData } from './ServicesClient';

export default async function ServicesPage(): Promise<JSX.Element> {
  const data: ServicesPageData = {
    initialServices: [],
    initialCategories: [],
    initialTotal: 0,
  };

  try {
    const caller = await getServerCaller();
    const [svcResult, categories] = await Promise.all([
      caller.services.list({ sort: 'newest', page: 1, limit: 12 }),
      caller.categories.list(),
    ]);

    data.initialServices = svcResult.items;
    data.initialTotal = svcResult.total;
    data.initialCategories = categories;
  } catch {
    // Client will retry with client-side queries on error
  }

  return <ServicesClient data={data} />;
}
