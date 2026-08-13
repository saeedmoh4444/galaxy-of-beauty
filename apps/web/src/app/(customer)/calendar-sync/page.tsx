'use client';
import { api } from '@/lib/trpc';
import { Card, Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function CalendarSyncPage(): JSX.Element {
  const { data: status, refetch } = api.calendarSync.status.useQuery() as {
    data: Record<string, unknown> | undefined;
    refetch: () => void;
  };
  const { data: upcoming } = api.calendarSync.upcoming.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
  };
  const connectMut = api.calendarSync.connect.useMutation({ onSuccess: () => refetch() });
  const disconnectMut = api.calendarSync.disconnect.useMutation({ onSuccess: () => refetch() });

  const connected = status?.connected as boolean;
  const events = upcoming ?? [];

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">️ مزامنة التقويم</h1>
          <p className="mt-1 text-sm text-text-secondary">اربطي تقويم قوقل لمزامنة مواعيدك</p>
        </div>
        <Card padding="lg" className="text-center">
          <span className="text-6xl">{connected ? '' : ''}</span>
          <h2 className="mt-4 text-xl font-bold">
            {connected ? 'التقويم مربوط' : 'لم يتم ربط التقويم بعد'}
          </h2>
          {connected && (
            <p className="text-sm text-text-secondary mt-1">
              آخر مزامنة:{' '}
              {status?.lastSynced
                ? new Date(status.lastSynced as string).toLocaleTimeString('ar-SA')
                : '—'}
            </p>
          )}
          <div className="mt-4">
            {connected ? (
              <Button
                onClick={() => disconnectMut.mutate()}
                loading={disconnectMut.isPending}
                variant="ghost"
              >
                قطع الاتصال
              </Button>
            ) : (
              <Button
                onClick={() => connectMut.mutate({ authCode: 'google-auth-code' })}
                loading={connectMut.isPending}
              >
                 ربط تقويم قوقل
              </Button>
            )}
          </div>
        </Card>
        {events.length > 0 && (
          <Card padding="lg">
            <h3 className="font-bold mb-4"> مواعيد قادمة</h3>
            <div className="space-y-2">
              {events.map((e: Record<string, unknown>) => (
                <div
                  key={e.id as number}
                  className="flex items-center gap-3 rounded-lg bg-surface-muted dark:bg-gray-800 p-3"
                >
                  <span className="text-2xl">{e.emoji as string}</span>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{e.title as string}</p>
                    <p className="text-xs text-text-secondary">‍ {e.technician as string}</p>
                  </div>
                  <span className="text-xs text-text-tertiary">
                    {new Date(e.date as string).toLocaleDateString('ar-SA', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
