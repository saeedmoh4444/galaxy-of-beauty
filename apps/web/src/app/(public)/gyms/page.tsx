import { getServerCaller, serializeForClient } from '@/lib/server-trpc';
import { GymsClient } from './GymsClient';
import type { GymsPageData } from './GymsClient';
import { getServerLocale } from '@/lib/i18n';
import { t } from '@galaxy/shared';

export default async function GymsPage(): Promise<JSX.Element> {
  const locale = await getServerLocale();

  const data: GymsPageData = { gyms: [] };

  try {
    const caller = await getServerCaller();
    const result = await caller.gyms.list({ page: 1, limit: 50 });
    data.gyms = serializeForClient(result.items ?? []);
  } catch (e) {
    data.fetchError = (e as Error).message || t('gyms.load-error', locale);
  }

  return <GymsClient data={data} />;
}
