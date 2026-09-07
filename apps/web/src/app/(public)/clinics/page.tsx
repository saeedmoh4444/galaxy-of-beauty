import { getServerCaller, serializeForClient } from '@/lib/server-trpc';
import { ClinicsClient } from './ClinicsClient';
import type { ClinicsPageData } from './ClinicsClient';
import { getServerLocale } from '@/lib/i18n';
import { t } from '@galaxy/shared';

export default async function ClinicsPage(): Promise<JSX.Element> {
  const locale = await getServerLocale();

  const data: ClinicsPageData = { clinics: [] };

  try {
    const caller = await getServerCaller();
    const result = await caller.clinics.list({ page: 1, limit: 50 });
    data.clinics = serializeForClient(result.items ?? []);
  } catch (e) {
    data.fetchError = (e as Error).message || t('clinics.load-error', locale);
  }

  return <ClinicsClient data={data} />;
}
