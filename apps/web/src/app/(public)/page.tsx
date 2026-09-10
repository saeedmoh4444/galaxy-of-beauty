import { getServerCaller, serializeForClient } from '@/lib/server-trpc';
import type { RouterOutputs } from '@galaxy/api';
import { t } from '@galaxy/shared';
import { getServerLocale } from '@/lib/i18n';
import { HomeClient } from './HomeClient';
import type { HomePageProps } from './HomeClient';

// Revalidate every 60s (ISR)
export const revalidate = 60;

type AnyCategory = RouterOutputs['categories']['list'][number];
type AnyService = RouterOutputs['services']['list']['items'][number];

export default async function HomePage(): Promise<JSX.Element> {
  const locale = await getServerLocale();
  let categories: AnyCategory[] = [];
  let services: AnyService[] = [];
  let serviceTotal = 0;
  let technicianTotal = 0;
  let placeCount = 0;
  let fetchError: string | undefined;

  try {
    const caller = await getServerCaller();

    const [catsResult, svcResult, techResult, coverageResult] = await Promise.all([
      caller.categories.list(),
      caller.services.list({ sort: 'popular', limit: 6 }),
      caller.technicians.list({ limit: 1 }),
      caller.technicians.coverage(),
    ]);

    // Serialize through superjson to strip Prisma Decimal → Number
    // before passing to Client Components (avoids Next.js RSC warnings)
    categories = serializeForClient(catsResult as AnyCategory[]);
    const svc = serializeForClient(svcResult as { items: AnyService[]; total: number });
    services = svc.items;
    serviceTotal = svc.total;

    // Trust stats (Phase 3 sprint 1): verified technician count + the
    // distinct areas they cover — falling back to the city count when no
    // verified technician has an area set (as in the main seed).
    const tech = serializeForClient(techResult as { total: number });
    const coverage = serializeForClient(coverageResult as { areas: string[]; cities: string[] });
    technicianTotal = tech.total;
    placeCount = coverage.areas.length > 0 ? coverage.areas.length : coverage.cities.length;
  } catch (e) {
    fetchError = (e as Error).message || t('marketing.home.load-error', locale);
  }

  return (
    <HomeClient
      initialCategories={
        serializeForClient(categories) as unknown as HomePageProps['initialCategories']
      }
      initialServices={serializeForClient(services) as unknown as HomePageProps['initialServices']}
      serviceTotal={serviceTotal}
      technicianTotal={technicianTotal}
      placeCount={placeCount}
      fetchError={fetchError}
    />
  );
}
