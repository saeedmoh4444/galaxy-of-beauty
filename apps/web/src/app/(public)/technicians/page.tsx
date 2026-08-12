import { getServerCaller } from '@/lib/server-trpc';
import { TechniciansClient } from './TechniciansClient';
import type { TechniciansPageData } from './TechniciansClient';

export default async function TechniciansPage(): Promise<JSX.Element> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: TechniciansPageData = { initialTechnicians: [] as any[] };

  try {
    const caller = await getServerCaller();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = (await caller.technicians.list({})) as any[];
    data.initialTechnicians = result;
  } catch {
    // Client will retry on error
  }

  return <TechniciansClient data={data} />;
}
