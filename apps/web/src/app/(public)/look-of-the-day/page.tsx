'use client';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button } from '@galaxy/ui';
import { useAuth } from '@galaxy/ui';

export default function LookOfTheDayPage(): JSX.Element {
  const { user } = useAuth();
  const { data: today, isLoading } = api.lookOfTheDay.today.useQuery() as { data: Record<string,unknown> | undefined; isLoading: boolean };
  const { data: feed } = api.lookOfTheDay.feed.useQuery({ page: 1, limit: 12 }) as { data: { items: Array<Record<string,unknown>> } | undefined };
  const voteMut = api.lookOfTheDay.vote.useMutation();

  const looks = feed?.items ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 text-center"><span className="text-6xl">📸</span><h1 className="mt-4 text-3xl font-bold">إطلالة اليوم</h1><p className="mt-2 text-text-secondary">صوّتي لأجمل إطلالة!</p></div>
      {isLoading ? <CardSkeleton /> : today ? (
        <Card padding="lg" className="mb-8 border-2 border-amber-300 dark:border-amber-700 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 text-center">
          <span className="text-5xl">🌟</span><h2 className="mt-2 text-xl font-bold">إطلالة اليوم</h2><p className="text-lg font-bold mt-1">{today.title as string}</p><p className="text-sm text-text-secondary">👩‍🎨 {today.technicianName as string} · ❤️ {today.votes as number} صوت</p>
          {user && <Button size="sm" className="mt-3" onClick={() => voteMut.mutate({ lookId: today.id as number })}>❤️ تصويت</Button>}
        </Card>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {looks.map((l: Record<string,unknown>) => (
          <Card key={l.id as number} padding="md" className="text-center">
            <div className="h-36 rounded-xl bg-gradient-to-br from-brand-100 to-purple-100 dark:from-brand-900 dark:to-purple-900 flex items-center justify-center text-4xl">📸</div>
            <h3 className="font-bold mt-2">{l.title as string}</h3><p className="text-xs text-text-secondary">{l.userName as string} · 👩‍🎨 {l.technicianName as string}</p>
            <div className="mt-2 flex items-center justify-center gap-2"><span className="text-sm">❤️ {l.votes as number}</span>{user && <button onClick={() => voteMut.mutate({ lookId: l.id as number })} className="text-red-400 hover:text-red-600 text-sm">تصويت</button>}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
