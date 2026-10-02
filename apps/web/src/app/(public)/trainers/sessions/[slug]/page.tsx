import type { JSX } from 'react';
import { getServerCaller, serializeForClient } from '@/lib/server-trpc';
import { TrainerClient } from './TrainerClient';
import type { TrainerDetailData } from './TrainerClient';
import { getServerLocale } from '@/lib/i18n';
import { t } from '@galaxy/shared';

export default async function TrainerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<JSX.Element> {
  const { slug } = await params;
  const locale = await getServerLocale();

  const data: { trainer: TrainerDetailData | null; fetchError?: string } = { trainer: null };

  try {
    const caller = await getServerCaller();
    const trainer = await caller.trainers.detail({ slug });
    if (trainer) {
      data.trainer = serializeForClient(trainer) as unknown as TrainerDetailData;
    }
  } catch {
    data.fetchError = t('trainers.load-error', locale);
  }

  return <TrainerClient trainer={data.trainer} fetchError={data.fetchError} />;
}
