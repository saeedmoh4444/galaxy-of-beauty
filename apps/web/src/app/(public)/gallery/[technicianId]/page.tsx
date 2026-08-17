import { getServerCaller } from '@/lib/server-trpc';
import { GalleryClient } from './GalleryClient';
import type { GalleryPageData } from './GalleryClient';

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ technicianId: string }>;
}): Promise<JSX.Element> {
  const { technicianId } = await params;
  const tid = Number(technicianId);

  const data: GalleryPageData = { items: [], total: 0 };

  if (isNaN(tid)) {
    data.fetchError = 'معرف الفنية غير صالح';
    return <GalleryClient data={data} />;
  }

  try {
    const caller = await getServerCaller();
    const result = await caller.gallery.byTechnician({
      technicianId: tid,
      page: 1,
      limit: 50,
    });
    data.items = result.items ?? [];
    data.total = result.total ?? 0;
  } catch (e) {
    data.fetchError = (e as Error).message || 'فشل تحميل المعرض';
  }

  return <GalleryClient data={data} />;
}
