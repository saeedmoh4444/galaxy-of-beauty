import type { JSX } from 'react';
import { getServerCaller, serializeForClient } from '@/lib/server-trpc';
import { NailBarsClient } from './NailBarsClient';
import type { NailBarsPageData } from './NailBarsClient';
import { getServerLocale } from '@/lib/i18n';
import { t } from '@galaxy/shared';

export default async function NailBarsPage({
  searchParams,
}: {
  searchParams: Promise<{ childFriendly?: string }>;
}): Promise<JSX.Element> {
  const locale = await getServerLocale();
  const params = await searchParams;

  const data: NailBarsPageData = {
    nailBars: [],
    childFriendly: params.childFriendly === '1',
  };

  try {
    const caller = await getServerCaller();
    const result = await caller.nailBars.list({
      page: 1,
      limit: 50,
      ...(params.childFriendly === '1' ? { childFriendly: true } : {}),
    });
    data.nailBars = serializeForClient(result.items ?? []);
  } catch (e) {
    data.fetchError = (e as Error).message || t('nailBars.load-error', locale);
  }

  return <NailBarsClient data={data} />;
}
