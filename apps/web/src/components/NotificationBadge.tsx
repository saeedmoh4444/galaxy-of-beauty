'use client';

import Link from 'next/link';
import { api } from '@/lib/trpc';
import { useAuth } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

export function NotificationBadge(): JSX.Element {
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useLocale();
  const { data } = api.notifications.unreadCount.useQuery(undefined, {
    enabled: !isLoading && !!isAuthenticated,
    retry: false,
  });
  const count = data?.count || 0;

  return (
    <Link
      href="/notifications"
      className="relative rounded-lg p-2 text-text-secondary hover:bg-surface-muted dark:text-text-tertiary dark:hover:bg-gray-800"
      title={t('nav.notifications')}
    >
      <span className="text-lg">🔔</span>
      {count > 0 && (
        <span className="absolute -top-0.5 -end-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  );
}
