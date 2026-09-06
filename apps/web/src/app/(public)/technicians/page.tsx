import { getServerCaller, serializeForClient } from '@/lib/server-trpc';
import { TechniciansClient } from './TechniciansClient';
import type { TechniciansPageData } from './TechniciansClient';

export default async function TechniciansPage(): Promise<JSX.Element> {
  const data: TechniciansPageData = { initialTechnicians: [] };

  try {
    const caller = await getServerCaller();
    const result = await caller.technicians.list({});
    data.initialTechnicians = serializeForClient(
      result,
    ) as unknown as TechniciansPageData['initialTechnicians'];
  } catch {
    // Client will retry on error
  }

  return <TechniciansClient data={data} />;
}
