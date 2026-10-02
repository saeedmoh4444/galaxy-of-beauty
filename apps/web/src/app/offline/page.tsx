'use client';
import type { JSX } from 'react';

import { Card, EmptyState } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

export default function OfflinePage(): JSX.Element {
  const { t } = useLocale();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md text-center" padding="lg">
        <EmptyState
          title={t('mobile.offline.title')}
          description={t('mobile.offline.desc')}
          action={{ label: t('button.retry'), onPress: () => window.location.reload() }}
        />
      </Card>
    </div>
  );
}
