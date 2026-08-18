'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import {
  Card,
  TableSkeleton,
  ErrorAlert,
  EmptyState,
  Input,
  Button,
  Pagination,
  PageContainer,
} from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';
import { type TranslationKey } from '@galaxy/shared';

const ACTION_OPTIONS: Array<{ value: string; labelKey: TranslationKey }> = [
  { value: '', labelKey: 'admin.all' },
  { value: 'LOGIN_SUCCESS', labelKey: 'admin.audit-log.action-login' },
  { value: 'SUSPEND_USER', labelKey: 'admin.audit-log.action-suspend-user' },
  { value: 'VERIFY_KYC', labelKey: 'admin.audit-log.action-verify-kyc' },
  { value: 'UPDATE_CATEGORY', labelKey: 'admin.audit-log.action-update-category' },
  { value: 'UPDATE_SERVICE', labelKey: 'admin.audit-log.action-update-service' },
  { value: 'CREATE_PROMO', labelKey: 'admin.audit-log.action-create-promo' },
  { value: 'REFUND_PAYMENT', labelKey: 'admin.audit-log.action-refund-payment' },
  { value: 'MAINTENANCE_MODE', labelKey: 'admin.audit-log.action-maintenance-mode' },
  { value: 'FEATURE_FLAG_CHANGED', labelKey: 'admin.audit-log.action-feature-flag' },
];

export default function AuditLogPage(): JSX.Element {
  const { t, locale } = useLocale();
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [targetFilter, setTargetFilter] = useState('');
  const [adminFilter, setAdminFilter] = useState('');

  const input = {
    page,
    limit: 20,
    action: actionFilter || undefined,
    targetType: targetFilter || undefined,
    adminId: adminFilter ? Number(adminFilter) : undefined,
  };

  const { data, isLoading, isError, refetch } = api.admin.auditLogs.useQuery(input) ?? {
    data: undefined,
    isLoading: false,
    isError: false,
    refetch: () => {},
  };

  const logs = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <PageContainer width="wide">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.audit-log.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('admin.audit-log.subtitle')}</p>
        </div>

        {/* Filters */}
        <Card padding="md">
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <label
                htmlFor="al-action-filter"
                className="mb-1 block text-xs font-medium text-text-secondary"
              >
                {t('admin.audit-log.action-header')}
              </label>
              <select
                id="al-action-filter"
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-edge bg-surface px-3 py-2 text-sm"
              >
                {ACTION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {t(o.labelKey)}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label={t('admin.audit-log.target-type')}
              placeholder={t('admin.audit-log.target-placeholder')}
              value={targetFilter}
              onChange={(e) => {
                setTargetFilter(e.target.value);
                setPage(1);
              }}
            />
            <Input
              label={t('admin.audit-log.admin-id')}
              placeholder="Admin ID"
              value={adminFilter}
              onChange={(e) => {
                setAdminFilter(e.target.value);
                setPage(1);
              }}
            />
            <div className="flex items-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setActionFilter('');
                  setTargetFilter('');
                  setAdminFilter('');
                  setPage(1);
                }}
              >
                {t('admin.audit-log.clear-filters')}
              </Button>
            </div>
          </div>
        </Card>

        {/* Logs Table */}
        {isLoading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : isError ? (
          <ErrorAlert message={t('admin.audit-log.load-error')} onRetry={() => refetch()} />
        ) : logs.length === 0 ? (
          <EmptyState
            title={t('admin.audit-log.empty')}
            description={t('admin.audit-log.empty-desc')}
          />
        ) : (
          <>
            <Card padding="none">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-edge bg-surface-muted text-xs text-text-secondary">
                    <tr>
                      <th className="px-4 py-3 text-right">#</th>
                      <th className="px-4 py-3 text-right">{t('admin.audit-log.action-header')}</th>
                      <th className="px-4 py-3 text-right">{t('admin.audit-log.type-header')}</th>
                      <th className="px-4 py-3 text-right">{t('admin.audit-log.target-header')}</th>
                      <th className="px-4 py-3 text-right">{t('admin.audit-log.admin-header')}</th>
                      <th className="px-4 py-3 text-right">{t('admin.audit-log.date-header')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-edge-muted">
                    {logs.map((log, i) => (
                      <tr key={i} className="hover:bg-surface-muted transition-colors">
                        <td className="px-4 py-2.5 text-text-tertiary">{log.id as number}</td>
                        <td className="px-4 py-2.5">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              (log.action as string)?.startsWith('ERROR_')
                                ? 'bg-red-100 text-red-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {log.action as string}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-text-secondary">
                          {log.targetType as string}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-xs">{log.targetId as string}</td>
                        <td className="px-4 py-2.5 text-text-secondary">
                          #{log.adminId as number}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-text-tertiary" dir="ltr">
                          {new Date(log.createdAt).toLocaleString(
                            locale === 'en' ? 'en-GB' : 'ar-SA',
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>
    </PageContainer>
  );
}
