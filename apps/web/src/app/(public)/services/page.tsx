/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerCaller } from '@/lib/server-trpc';
import { ServicesClient } from './ServicesClient';
import type { ServicesPageData } from './ServicesClient';

export default async function ServicesPage(): Promise<JSX.Element> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: ServicesPageData = { initialServices: [] as any[], initialCategories: [] as any[], initialTotal: 0 };

  try {
    const caller = await getServerCaller();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [svcResult, categories] = await Promise.all([
      caller.services.list({ sort: 'newest', page: 1, limit: 12 }) as any,
      caller.categories.list() as any,
    ]);

    data.initialServices = svcResult.items as any[];
    data.initialTotal = svcResult.total as number;
    data.initialCategories = categories as any[];
  } catch {
    // Client will retry with client-side queries on error
  }

  return <ServicesClient data={data} />;
}
