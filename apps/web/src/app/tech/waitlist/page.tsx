'use client';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function TechWaitlistPage(): JSX.Element {
  const { data: waitlist, isLoading } = api.bookings.getTechnicianPending.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
  };
  const bookings = waitlist ?? [];

  return (
    <DashboardLayout userRole="TECHNICIAN">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold"> طلبات معلقة</h1>
          <p className="mt-1 text-sm text-text-secondary">الحجوزات اللي تنتظر موافقتكِ</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }, (_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <Card padding="lg" className="text-center py-8">
            <p className="text-4xl mb-2"></p>
            <p className="text-text-secondary">مافي طلبات معلقة</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {bookings.map((b: Record<string, unknown>) => {
              const service = b.service as Record<string, unknown> | undefined;
              return (
                <Card key={b.id as number} padding="md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold">
                        {(service?.titleJson as Record<string, string>)?.ar ?? `حجز #${b.id}`}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {new Date(b.startAt as string).toLocaleDateString('ar-SA', {
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        · {b.bookingCode as string}
                      </p>
                    </div>
                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs text-yellow-700">
                      معلق
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
