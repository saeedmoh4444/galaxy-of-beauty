import { getServerCaller } from '@/lib/server-trpc';
import { HomeClient } from './HomeClient';
import type { HomePageProps } from './HomeClient';

// Revalidate every 60s (ISR)
export const revalidate = 60;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyCategory = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyService = any;

export default async function HomePage(): Promise<JSX.Element> {
  let categories: AnyCategory[] = [];
  let services: AnyService[] = [];
  let serviceTotal = 0;
  let fetchError: string | undefined;

  try {
    const caller = await getServerCaller();

    const [catsResult, svcResult] = await Promise.all([
      caller.categories.list(),
      caller.services.list({ sort: 'popular', limit: 6 }),
    ]);

    categories = catsResult as AnyCategory[];
    services = (svcResult as { items: AnyService[] }).items;
    serviceTotal = (svcResult as { total: number }).total;
  } catch (e) {
    fetchError = (e as Error).message || 'فشل تحميل البيانات';
  }

  return (
    <HomeClient
      initialCategories={categories as HomePageProps['initialCategories']}
      initialServices={services as HomePageProps['initialServices']}
      serviceTotal={serviceTotal}
      fetchError={fetchError}
    />
  );
}
