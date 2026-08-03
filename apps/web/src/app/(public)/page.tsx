import { getServerCaller, serializeForClient } from '@/lib/server-trpc';
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

    // Serialize through superjson to strip Prisma Decimal → Number
    // before passing to Client Components (avoids Next.js RSC warnings)
    categories = serializeForClient(catsResult as AnyCategory[]);
    const svc = serializeForClient(svcResult as { items: AnyService[]; total: number });
    services = svc.items;
    serviceTotal = svc.total;
  } catch (e) {
    fetchError = (e as Error).message || 'فشل تحميل البيانات';
  }

  return (
    <HomeClient
      initialCategories={serializeForClient(categories as HomePageProps['initialCategories'])}
      initialServices={serializeForClient(services as HomePageProps['initialServices'])}
      serviceTotal={serviceTotal}
      fetchError={fetchError}
    />
  );
}
