import { getServerCaller } from '@/lib/server-trpc';
import { ServiceDetailClient } from './ServiceDetailClient';
import type { ServiceDetailData } from './ServiceDetailClient';

export default async function ServiceDetailPage({
  params,
}: {
  params: { id: string };
}): Promise<JSX.Element> {
  const { id } = params;

  const data: ServiceDetailData = {
    id: Number(id),
    titleJson: {},
    descriptionJson: null,
    basePrice: 0,
    durationMin: 0,
    category: {},
    variants: [],
    technicianServices: [],
    tags: [],
    related: [],
  };

  if (isNaN(Number(id))) {
    data.fetchError = 'معرف الخدمة غير صالح';
    return <ServiceDetailClient svc={data} />;
  }

  try {
    const caller = await getServerCaller();
    const serviceId = Number(id);
    const svc = (await caller.services.getById({ id: serviceId })) as Record<string, unknown>;
    const relatedResult = await caller.services.getRelated({ serviceId, limit: 4 });

    data.id = serviceId;
    data.titleJson = (svc.titleJson ?? {}) as Record<string, unknown>;
    data.descriptionJson = svc.descriptionJson as Record<string, unknown> | null;
    data.basePrice = Number(svc.basePrice ?? 0);
    data.durationMin = Number(svc.durationMin ?? 0);
    data.category = svc.category as Record<string, unknown>;
    data.variants = (svc.variants as Array<Record<string, unknown>>) ?? [];
    data.technicianServices = (svc.technicianServices as Array<Record<string, unknown>>) ?? [];
    data.tags = (svc.tags as Array<{ tag: { nameJson: Record<string, unknown> } }>) ?? [];
    data.related = (relatedResult as Array<Record<string, unknown>>) ?? [];
  } catch (e) {
    data.fetchError = (e as Error).message || 'فشل تحميل الخدمة';
  }

  return <ServiceDetailClient svc={data} />;
}
