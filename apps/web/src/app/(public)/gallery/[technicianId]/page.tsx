import { getServerCaller, serializeForClient } from '@/lib/server-trpc';
import { GalleryClient } from './GalleryClient';
import type { GalleryPageData } from './GalleryClient';
import { getServerLocale } from '@/lib/i18n';
import { t } from '@galaxy/shared';

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ technicianId: string }>;
}): Promise<JSX.Element> {
  const { technicianId } = await params;
  const tid = Number(technicianId);
  const locale = await getServerLocale();

  const data: GalleryPageData = { items: [], total: 0 };

  if (isNaN(tid)) {
    data.fetchError = t('marketing.gallery.invalid-id', locale);
    return <GalleryClient data={data} />;
  }

  try {
    const caller = await getServerCaller();
    const result = await caller.gallery.byTechnician({
      technicianId: tid,
      page: 1,
      limit: 50,
    });
    data.items = serializeForClient(result.items ?? []);
    data.total = result.total ?? 0;
  } catch (e) {
    data.fetchError = (e as Error).message || t('marketing.gallery.load-error', locale);
  }

  return <GalleryClient data={data} />;
}
