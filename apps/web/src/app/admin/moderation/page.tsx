'use client';
import type { JSX } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, Button, EmptyState, useAuth, ErrorAlert } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';
import type { TranslationKey } from '@galaxy/shared';

const TARGET_TYPE_KEYS: Record<string, TranslationKey> = {
  review: 'admin.moderation.target.review',
  community_post: 'admin.moderation.target.community_post',
  community_comment: 'admin.moderation.target.community_comment',
  beauty_post: 'admin.moderation.target.beauty_post',
  beauty_post_comment: 'admin.moderation.target.beauty_post_comment',
  gallery_image: 'admin.moderation.target.gallery_image',
  product_review: 'admin.moderation.target.product_review',
};

const REASON_KEYS: Record<string, TranslationKey> = {
  inappropriate: 'admin.moderation.reason.inappropriate',
  spam: 'admin.moderation.reason.spam',
  privacy: 'admin.moderation.reason.privacy',
  other: 'admin.moderation.reason.other',
};

/** t() is keyed by the typed union — fall back to a safe generic label. */
function labelFor(map: Record<string, TranslationKey>, key: string): TranslationKey {
  return map[key] ?? 'admin.moderation.reason.other';
}

export default function AdminModerationPage(): JSX.Element {
  const { t } = useLocale();
  const { isAuthenticated } = useAuth();

  const queueQ = api.moderation.queue.useQuery({ limit: 50 }, { enabled: isAuthenticated });
  const resolveMut = api.moderation.resolve.useMutation({ onSuccess: () => queueQ.refetch() });

  const rows = queueQ.data?.items ?? [];

  const decide = (
    reportId: number,
    decision: 'dismiss' | 'hide' | 'remove' | 'hide_and_suspend',
  ) => {
    resolveMut.mutate({ reportId, decision });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('admin.moderation.title')}</h1>
        <p className="mt-1 text-sm text-text-secondary">{t('admin.moderation.subtitle')}</p>
      </div>

      {queueQ.isError ? (
        <ErrorAlert message={t('state.error')} onRetry={() => queueQ.refetch()} />
      ) : queueQ.isLoading ? (
        <CardListSkeleton count={4} />
      ) : rows.length === 0 ? (
        <EmptyState title={t('admin.moderation.empty')} />
      ) : (
        rows.map((row) => (
          <Card key={row.id} className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-full bg-accent/10 px-2 py-0.5 font-medium">
                {t(labelFor(TARGET_TYPE_KEYS, row.targetType))} #{row.targetId}
              </span>
              <span className="rounded-full bg-warning/10 px-2 py-0.5">
                {t(labelFor(REASON_KEYS, row.reason))}
              </span>
              <span className="text-text-secondary">
                {t('admin.moderation.reporter')}: {row.reporterName}
              </span>
              {row.authorName && (
                <span className="text-text-secondary">
                  {t('admin.moderation.author')}: {row.authorName}
                </span>
              )}
            </div>

            <p className="rounded-md bg-surface-muted p-3 text-sm" dir="auto">
              {row.preview || '—'}
            </p>
            {row.note && (
              <p className="text-sm text-text-secondary" dir="auto">
                {row.note}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" size="sm" onClick={() => decide(row.id, 'dismiss')}>
                {t('admin.moderation.dismiss')}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => decide(row.id, 'hide')}>
                {t('admin.moderation.hide')}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => decide(row.id, 'hide_and_suspend')}
              >
                {t('admin.moderation.suspend')}
              </Button>
              <Button variant="danger" size="sm" onClick={() => decide(row.id, 'remove')}>
                {t('admin.moderation.remove')}
              </Button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
