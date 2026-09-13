import { getServerCaller, serializeForClient } from '@/lib/server-trpc';
import { TrainersClient } from './TrainersClient';
import type { TrainersPageData } from './TrainersClient';
import { getServerLocale } from '@/lib/i18n';
import { t } from '@galaxy/shared';

export default async function TrainersPage(): Promise<JSX.Element> {
  const locale = await getServerLocale();

  const data: TrainersPageData = { trainers: [] };

  try {
    const caller = await getServerCaller();
    const result = await caller.technicians.trainers();
    data.trainers = serializeForClient(result ?? []);
  } catch (e) {
    data.fetchError = (e as Error).message || t('trainers.load-error', locale);
  }

  return <TrainersClient data={data} />;
}
