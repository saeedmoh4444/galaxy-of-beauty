import { getServerCaller } from '@/lib/server-trpc';
import { TechnicianProfileClient } from './TechnicianProfileClient';
import type { TechnicianProfileData } from './TechnicianProfileClient';

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
        getById: (input: { id: number }) => Promise<Record<string, unknown> | null>;
        getServices: (input: { technicianId: number }) => Promise<Array<Record<string, unknown>>>;
      };
    };
    const [tech, services] = await Promise.all([
      legacyCaller.technicians.getById({ id: tid }),
      legacyCaller.technicians.getServices({ technicianId: tid }),
    ]);
    data.technician = tech;
    data.services = services;
  } catch {
    // Client will show error
  }

  return <TechnicianProfileClient data={data} />;
}
