import { getServerCaller } from '@/lib/server-trpc';
import { ServiceDetailClient } from './ServiceDetailClient';
import type { ServiceDetailData } from './ServiceDetailClient';

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const { id } = await params;

  const data: ServiceDetailData = {
    id: Number(id),
    titleJson: {},
    descriptionJson: null,
    basePrice: 0,
    durationMin: 0,
    category: {} as ServiceDetailData['category'],
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
    data.titleJson = (svc.titleJson ?? {}) as ServiceDetailData['titleJson'];
    data.descriptionJson = svc.descriptionJson as ServiceDetailData['descriptionJson'];
    data.basePrice = Number(svc.basePrice ?? 0);
    data.durationMin = Number(svc.durationMin ?? 0);
    data.category = svc.category as ServiceDetailData['category'];
    data.variants = (svc.variants as ServiceDetailData['variants']) ?? [];
    data.technicianServices =
      (svc.technicianServices as ServiceDetailData['technicianServices']) ?? [];
    data.tags = (svc.tags as ServiceDetailData['tags']) ?? [];
    data.related = (relatedResult as ServiceDetailData['related']) ?? [];
  } catch (e) {
    data.fetchError = (e as Error).message || 'فشل تحميل الخدمة';
  }

  return <ServiceDetailClient svc={data} />;
}
