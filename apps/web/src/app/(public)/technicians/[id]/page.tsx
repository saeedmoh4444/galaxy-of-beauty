import { getServerCaller, serializeForClient } from '@/lib/server-trpc';
import { TechnicianProfileClient } from './TechnicianProfileClient';
import type {
  TechnicianProfileData,
  TechnicianProfileItem,
  TechnicianServiceItem,
} from './TechnicianProfileClient';

export default async function TechnicianProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const { id } = await params;
  const tid = Number(id);
  const data: TechnicianProfileData = { technician: null, services: [] };

  if (isNaN(tid)) {
    return <TechnicianProfileClient data={data} />;
  }

  try {
    const caller = await getServerCaller();
    // Legacy call shape — the router expects { userId } / { techId }, the page
    // historically passed { id } / { technicianId }; keep the exact runtime call.
    const legacyCaller = caller as unknown as {
      technicians: {
        getById: (input: { id: number }) => Promise<TechnicianProfileItem | null>;
        getServices: (input: { technicianId: number }) => Promise<TechnicianServiceItem[]>;
      };
    };
    const [tech, services] = await Promise.all([
      legacyCaller.technicians.getById({ id: tid }),
      legacyCaller.technicians.getServices({ technicianId: tid }),
    ]);
    data.technician = serializeForClient(tech);
    data.services = serializeForClient(services);
  } catch {
    // Client will show error
  }

  return <TechnicianProfileClient data={data} />;
}
