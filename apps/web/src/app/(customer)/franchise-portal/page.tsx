'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, KPIRowSkeleton, Button, Modal, formatCurrency } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

export default function FranchisePortalPage(): JSX.Element {
  const { t } = useLocale();
  const { data: dash, isLoading } = api.franchisePortal.dashboard.useQuery() as {
    data: Record<string, unknown> | undefined;
    isLoading: boolean;
  };
  const { data: locations } = api.franchisePortal.locations.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
  };
  const addMut = api.franchisePortal.addLocation.useMutation();
  const [show, setShow] = useState(false);
  const [city, setCity] = useState('');
  const [branch, setBranch] = useState('');

  const locs = (locations ?? []) as Array<Record<string, unknown>>;

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t('franchisePortal.title')}</h1>
            <p className="mt-1 text-sm text-text-secondary">{t('franchisePortal.subtitle')}</p>
          </div>
          <Button onClick={() => setShow(true)}>{t('franchisePortal.addBranch')}</Button>
        </div>
        {isLoading ? (
          <KPIRowSkeleton count={4} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-4">
            <Card padding="md" className="text-center">
              <p className="text-3xl"></p>
              <p className="text-2xl font-bold text-brand-600">
                {formatCurrency((dash?.totalRevenue as number) ?? 0)}
              </p>
              <p className="text-xs text-text-secondary">{t('franchisePortal.revenue')}</p>
            </Card>
            <Card padding="md" className="text-center">
              <p className="text-3xl"></p>
              <p className="text-2xl font-bold">{(dash?.totalBookings as number) ?? 0}</p>
              <p className="text-xs text-text-secondary">{t('franchisePortal.bookings')}</p>
            </Card>
            <Card padding="md" className="text-center">
              <p className="text-3xl">‍</p>
              <p className="text-2xl font-bold">{(dash?.totalStaff as number) ?? 0}</p>
              <p className="text-xs text-text-secondary">{t('franchisePortal.staff')}</p>
            </Card>
            <Card padding="md" className="text-center">
              <p className="text-3xl"></p>
              <p className="text-2xl font-bold text-green-600">+{(dash?.growth as number) ?? 0}%</p>
              <p className="text-xs text-text-secondary">{t('franchisePortal.growth')}</p>
            </Card>
          </div>
        )}
        <div className="space-y-3">
          {locs.map((l: Record<string, unknown>) => (
            <Card key={l.id as number} padding="md" className="flex items-center justify-between">
              <div>
                <p className="font-bold">{l.branch as string}</p>
                <p className="text-xs text-text-secondary">
                  {l.city as string} ·{' '}
                  {t('franchisePortal.staffCount', { count: l.staff as number })}
                </p>
              </div>
              <div className="text-right flex items-center gap-4">
                <span>{t('franchisePortal.bookingsCount', { count: l.bookings as number })}</span>
                <span className="font-bold text-brand-600">
                  {formatCurrency(l.revenue as number)}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${l.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                >
                  {l.status === 'active'
                    ? t('franchisePortal.active')
                    : t('franchisePortal.pending')}
                </span>
              </div>
            </Card>
          ))}
        </div>
        <Modal open={show} onClose={() => setShow(false)} title={t('franchisePortal.modalTitle')}>
          <div className="space-y-3">
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder={t('franchisePortal.cityPlaceholder')}
              className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
            <input
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder={t('franchisePortal.branchPlaceholder')}
              className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
            <Button
              onClick={() => {
                if (city && branch) addMut.mutate({ city, branch });
              }}
              loading={addMut.isPending}
              className="w-full"
            >
              {t('franchisePortal.add')}
            </Button>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
