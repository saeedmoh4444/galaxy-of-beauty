import { getServerCaller, serializeForClient } from '@/lib/server-trpc';
import { ServiceDetailClient } from './ServiceDetailClient';
import type { ServiceDetailData } from './ServiceDetailClient';
import { getServerLocale } from '@/lib/i18n';
import { t } from '@galaxy/shared';

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const { id } = await params;
  const locale = await getServerLocale();

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
    data.fetchError = t('marketing.services.invalid-id', locale);
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
    data.category = serializeForClient(svc.category as ServiceDetailData['category']);
    data.variants = serializeForClient((svc.variants as ServiceDetailData['variants']) ?? []);
    data.technicianServices = serializeForClient(
      (svc.technicianServices as ServiceDetailData['technicianServices']) ?? [],
    );
    data.tags = serializeForClient((svc.tags as ServiceDetailData['tags']) ?? []);
    data.related = serializeForClient((relatedResult as ServiceDetailData['related']) ?? []);
  } catch (e) {
    data.fetchError = (e as Error).message || t('marketing.services.load-error', locale);
  }

  return <ServiceDetailClient svc={data} />;
}
