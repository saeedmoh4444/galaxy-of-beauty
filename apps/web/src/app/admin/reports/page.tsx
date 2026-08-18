'use client';
import { api } from '@/lib/trpc';
import { Card, DashboardSkeleton, Button, formatCurrency } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

export default function AdminReportsPage(): JSX.Element {
  const { t } = useLocale();
  const { data, isLoading } = api.adminReports.dashboard.useQuery() as {
    data: Record<string, unknown> | undefined;
    isLoading: boolean;
  };
  const { data: csv } = api.adminReports.exportCSV.useQuery() as {
    data: Record<string, string> | undefined;
  };

  const d = data ?? {};
  const topTechs = (d.topTechs ?? []) as Array<Record<string, unknown>>;
  const byService = (d.byService ?? []) as Array<Record<string, unknown>>;
  const byCity = (d.byCity ?? []) as Array<Record<string, unknown>>;
  const revenueData = (d.revenue as Record<string, unknown[]>) ?? {};
  const bookingsData = (d.bookings as Record<string, unknown[]>) ?? {};

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('admin.reports.title')}</h1>
        <div className="flex gap-2">
          {csv && (
            <Button
              size="sm"
              onClick={() => downloadCSV(csv.topTechs as string, 'top-technicians.csv')}
            >
              {t('admin.reports.csv-technicians')}
            </Button>
          )}
          {csv && (
            <Button size="sm" onClick={() => downloadCSV(csv.byService as string, 'services.csv')}>
              {t('admin.reports.csv-services')}
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card padding="lg">
              <h3 className="font-bold mb-4">{t('admin.reports.monthly-revenue')}</h3>
              <div className="flex items-end gap-1 h-32">
                {(revenueData.data as number[])?.map((v: number, i: number) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-brand-400 to-brand-600"
                      style={{ height: `${Math.max(4, (v / 500000) * 100)}%` }}
                    />
                    <span className="text-[8px] text-text-tertiary">
                      {(revenueData.labels as string[])?.[i]}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
            <Card padding="lg">
              <h3 className="font-bold mb-4">{t('admin.reports.monthly-bookings')}</h3>
              <div className="flex items-end gap-1 h-32">
                {(bookingsData.data as number[])?.map((v: number, i: number) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-green-400 to-emerald-600"
                      style={{ height: `${Math.max(4, (v / 2000) * 100)}%` }}
                    />
                    <span className="text-[8px] text-text-tertiary">
                      {(bookingsData.labels as string[])?.[i]}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          <Card padding="lg">
            <h3 className="font-bold mb-4">{t('admin.reports.top-technicians')}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-right text-text-secondary border-b dark:border-gray-700">
                    <th className="py-2 px-3">{t('admin.reports.name-header')}</th>
                    <th className="py-2 px-3">{t('admin.reports.revenue-header')}</th>
                    <th className="py-2 px-3">{t('admin.reports.bookings-header')}</th>
                    <th className="py-2 px-3">{t('admin.reports.rating-header')}</th>
                  </tr>
                </thead>
                <tbody>
                  {topTechs.map((tech: Record<string, unknown>, i: number) => (
                    <tr key={i} className="border-b dark:border-gray-700">
                      <td className="py-2 px-3 font-bold">{tech.name as string}</td>
                      <td className="py-2 px-3">{formatCurrency(tech.revenue as number)}</td>
                      <td className="py-2 px-3">{tech.bookings as number}</td>
                      <td className="py-2 px-3"> {tech.rating as number}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card padding="lg">
              <h3 className="font-bold mb-4">{t('admin.reports.by-service')}</h3>
              <div className="space-y-2">
                {byService.map((s: Record<string, unknown>, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-20 text-xs">{s.name as string}</span>
                    <div className="flex-1 h-3 rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-3 rounded-full bg-brand-500"
                        style={{ width: `${s.pct as number}%` }}
                      />
                    </div>
                    <span className="text-xs w-10">{s.pct as number}%</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card padding="lg">
              <h3 className="font-bold mb-4">{t('admin.reports.by-city')}</h3>
              <div className="space-y-2">
                {byCity.map((c: Record<string, unknown>, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{c.city as string}</span>
                    <span className="text-text-secondary">
                      {t('admin.reports.bookings-count', { count: c.bookings as number })}
                    </span>
                    <span className="font-bold">{formatCurrency(c.revenue as number)}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
