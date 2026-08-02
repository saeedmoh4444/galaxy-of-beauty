/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerCaller } from '@/lib/server-trpc';
import { TechnicianProfileClient } from './TechnicianProfileClient';
import type { TechnicianProfileData } from './TechnicianProfileClient';

export default async function TechnicianProfilePage({
  params,
}: {
  params: { id: string };
}): Promise<JSX.Element> {
  const tid = Number(params.id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: TechnicianProfileData = { technician: null as any, services: [] as any[] };

  if (isNaN(tid)) {
    return <TechnicianProfileClient data={data} />;
  }

  try {
    const caller = await getServerCaller();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [tech, services] = await Promise.all([
      caller.technicians.getById({ id: tid }) as any,
      caller.technicians.getServices({ technicianId: tid }) as any,
    ]);
    data.technician = tech;
    data.services = services;
  } catch {
    // Client will show error
  }

  return <TechnicianProfileClient data={data} />;
}
