'use client';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, Button } from '@galaxy/ui';
import { useAuth } from '@galaxy/ui';

export default function AudioRoomsPage(): JSX.Element {
  const { user } = useAuth();
  const { data, isLoading } = api.audioRooms.rooms.useQuery() as {
    data:
      | { live: Array<Record<string, unknown>>; upcoming: Array<Record<string, unknown>> }
      | undefined;
    isLoading: boolean;
  };
  const joinMut = api.audioRooms.join.useMutation();
  const live = data?.live ?? [];
  const upcoming = data?.upcoming ?? [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 text-center">
        <span className="text-6xl">️</span>
        <h1 className="mt-4 text-3xl font-bold">الغرف الصوتية</h1>
        <p className="mt-2 text-text-secondary">انضمي لنقاشات مباشرة مع خبراء التجميل</p>
      </div>
      {isLoading ? (
        <CardListSkeleton count={4} />
      ) : (
        <>
          {live.length > 0 && <h3 className="font-bold mb-3"> مباشر الآن</h3>}
          {live.map((r: Record<string, unknown>) => (
            <Card
              key={r.id as number}
              padding="lg"
              className="mb-3 border-2 border-red-200 dark:border-red-800"
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">️</span>
                <div className="flex-1">
                  <h3 className="font-bold">{r.title as string}</h3>
                  <p className="text-xs text-text-secondary">
                    {r.host as string} · {r.listeners as number} مستمع
                  </p>
                </div>
                {user && (
                  <Button size="sm" onClick={() => joinMut.mutate({ roomId: r.id as number })}>
                    انضمام
                  </Button>
                )}
              </div>
            </Card>
          ))}
          {upcoming.length > 0 && <h3 className="font-bold mb-3 mt-6"> قادم</h3>}
          {upcoming.map((r: Record<string, unknown>) => (
            <Card key={r.id as number} padding="lg" className="mb-3 opacity-70">
              <div className="flex items-center gap-4">
                <span className="text-3xl">️</span>
                <div className="flex-1">
                  <h3 className="font-bold">{r.title as string}</h3>
                  <p className="text-xs text-text-secondary">
                    {r.host as string} ·{' '}
                    {new Date(r.scheduledFor as string).toLocaleDateString('ar-SA', {
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}
