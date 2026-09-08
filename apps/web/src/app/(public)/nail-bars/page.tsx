import { getServerCaller, serializeForClient } from '@/lib/server-trpc';
import { NailBarsClient } from './NailBarsClient';
import type { NailBarsPageData } from './NailBarsClient';
import { getServerLocale } from '@/lib/i18n';
import { t } from '@galaxy/shared';

export default async function NailBarsPage(): Promise<JSX.Element> {
  const locale = await getServerLocale();

  const data: NailBarsPageData = { nailBars: [] };

  try {
    const caller = await getServerCaller();
    const result = await caller.nailBars.list({ page: 1, limit: 50 });
    data.nailBars = serializeForClient(result.items ?? []);
  } catch (e) {
    data.fetchError = (e as Error).message || t('nailBars.load-error', locale);
  }

  return <NailBarsClient data={data} />;
}
