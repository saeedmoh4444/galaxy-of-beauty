import { getServerCaller, serializeForClient } from '@/lib/server-trpc';
import { StoresClient } from './StoresClient';
import type { StoresPageData } from './StoresClient';
import { getServerLocale } from '@/lib/i18n';
import { t } from '@galaxy/shared';

export default async function StoresPage(): Promise<JSX.Element> {
  const locale = await getServerLocale();

  const data: StoresPageData = { stores: [] };

  try {
    const caller = await getServerCaller();
    const result = await caller.marketplace.vendors({ page: 1, limit: 50 });
    data.stores = serializeForClient(result.items ?? []);
  } catch (e) {
    data.fetchError = (e as Error).message || t('stores.load-error', locale);
  }

  return <StoresClient data={data} />;
}
