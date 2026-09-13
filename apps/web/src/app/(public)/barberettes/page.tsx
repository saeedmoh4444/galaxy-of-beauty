import { getServerCaller, serializeForClient } from '@/lib/server-trpc';
import { BarberettesClient } from './BarberettesClient';
import type { BarberettesPageData } from './BarberettesClient';
import { getServerLocale } from '@/lib/i18n';
import { t } from '@galaxy/shared';

export default async function BarberettesPage(): Promise<JSX.Element> {
  const locale = await getServerLocale();

  const data: BarberettesPageData = { barberettes: [] };

  try {
    const caller = await getServerCaller();
    const result = await caller.technicians.barberettes();
    data.barberettes = serializeForClient(result ?? []);
  } catch (e) {
    data.fetchError = (e as Error).message || t('barberettes.load-error', locale);
  }

  return <BarberettesClient data={data} />;
}
