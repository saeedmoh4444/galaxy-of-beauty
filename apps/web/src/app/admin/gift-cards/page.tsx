'use client';
import { api } from '@/lib/trpc';
import { Card, TableSkeleton, ErrorAlert, EmptyState, formatCurrency } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

export default function AdminGiftCardsPage(): JSX.Element {
  const { t, locale } = useLocale();
  const { data, isLoading, isError, refetch } = api.giftCards.listAll.useQuery({
    page: 1,
    limit: 50,
  });
  const items = data?.items ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('admin.gift-cards.title')}</h1>
      {isLoading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : isError ? (
        <ErrorAlert message={t('admin.gift-cards.load-error')} onRetry={() => refetch()} />
      ) : items.length === 0 ? (
        <EmptyState title={t('admin.gift-cards.empty')} />
      ) : (
        <Card padding="none">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-text-secondary dark:bg-gray-800">
              <tr>
                <th className="p-3 text-right">{t('admin.gift-cards.code-header')}</th>
                <th className="p-3 text-right">{t('admin.gift-cards.amount-header')}</th>
                <th className="p-3 text-right">{t('admin.gift-cards.balance-header')}</th>
                <th className="p-3 text-right">{t('admin.gift-cards.status-header')}</th>
                <th className="p-3 text-right">{t('admin.gift-cards.date-header')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {items.map((c) => (
                <tr key={c.id}>
                  <td className="p-3 font-mono font-bold text-brand-600">{c.code}</td>
                  <td className="p-3">{formatCurrency(Number(c.amount))}</td>
                  <td className="p-3">{formatCurrency(Number(c.balance))}</td>
                  <td className="p-3">
                    <span
                      className={`rounded px-2 py-0.5 text-xs ${c.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-surface-muted text-text-secondary'}`}
                    >
                      {c.status === 'ACTIVE'
                        ? t('admin.gift-cards.active')
                        : t('admin.gift-cards.used')}
                    </span>
                  </td>
                  <td className="p-3 text-text-tertiary">
                    {new Date(c.createdAt).toLocaleDateString(locale === 'en' ? 'en-GB' : 'ar-SA')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
