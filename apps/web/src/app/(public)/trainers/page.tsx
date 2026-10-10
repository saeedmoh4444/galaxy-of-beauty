import type { JSX } from 'react';
import { getServerCaller, serializeForClient } from '@/lib/server-trpc';
import { TrainersClient } from './TrainersClient';
import type { TrainersPageData } from './TrainersClient';
import { getServerLocale } from '@/lib/i18n';
import { t } from '@galaxy/shared/i18n/web-server';

export default async function TrainersPage(): Promise<JSX.Element> {
  const locale = await getServerLocale();

  const data: TrainersPageData = { trainers: [], sessionTrainers: [] };

  try {
    const caller = await getServerCaller();
    const result = await caller.technicians.trainers();
    data.trainers = serializeForClient(result ?? []);
    // Stage 12 — verified TRAINER vendors offer bookable 1:1 sessions.
    const sessionRows = await caller.trainers.list();
    data.sessionTrainers = serializeForClient(sessionRows ?? []);
  } catch (e) {
    data.fetchError = (e as Error).message || t('trainers.load-error', locale);
  }

  return <TrainersClient data={data} />;
}
